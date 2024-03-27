import { TezosToolkit, OpKind } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";

const FA2 = "KT1J6NY5AU61GzUX51n59wwiZcGJ9DrNTwbK";
const MINTER = "KT1CK9RnWZGnejBeT6gJfgvf4p7f1NwhP9wS";
const MARKET = "KT1VoZeuBMJF6vxtLqEFMoc4no5VDG789D7z";
const REGISTER = "KT1QSERFwHZcQfUf6ZruTSLMBfzitRs6ixmP";

const preferredNetwork = "mainnet";
const options = {
  name: "typed.art",
  iconUrl: "https://typed.art/logo192.png",
  preferredNetwork: preferredNetwork,
};
const rpcURL = "https://mainnet.api.tez.ie";
const wallet = new BeaconWallet(options);
const tezos = new TezosToolkit(rpcURL);
tezos.setWalletProvider(wallet);
const changeButton = (buttonID) => {
  id = buttonID;
  document.getElementById(buttonID).innerHTML = "waiting...";
  document.getElementById(buttonID).disabled = true;
};

let id = "";

const enableButton = (buttonID, buttonText) => {
  document.getElementById(buttonID).innerHTML = buttonText;
  document.getElementById(buttonID).disabled = false;
};

const getActiveAccount = async () => {
  return await wallet.client.getActiveAccount();
};

const connectWallet = async () => {
  let account = await wallet.client.getActiveAccount();

  if (!account) {
    await wallet.requestPermissions({
      network: { type: preferredNetwork },
    });
    account = await wallet.client.getActiveAccount();
  }
  window.location.reload(false);
  return { success: true, wallet: account.address };
};

const disconnectWallet = async () => {
  await wallet.disconnect();
  window.location.reload(false);
  return { success: true, wallet: null };
};

const checkIfWalletConnected = async (wallet) => {
  try {
    const activeAccount = await wallet.client.getActiveAccount();
    if (!activeAccount) {
      await wallet.client.requestPermissions({
        type: { network: preferredNetwork },
      });
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};
export const typed_mint = async (objkt_amount, ipfs_link) => {
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    await tezos.wallet
      .at(MINTER)
      .then((c) =>
        c.methods
          .mint_TYPED(
            parseFloat(objkt_amount), // nft adeti
            ("ipfs://" + ipfs_link)
              .split("")
              .reduce(
                (hex, c) =>
                  (hex += c.charCodeAt(0).toString(16).padStart(2, "0")),
                ""
              ) //ipfs linki byte kodu
          )
          .send({ amount: 0, storageLimit: 310 })
      )
      .then((e) => {
        window.location = "/";
      })
      .catch((e) => {
        enableButton("mintButton", "mint");
      });
  }
};
export const collect = async (swapid, price, objkt_id) => {
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    var collect = await tezos.wallet.at(MARKET).then((c) =>
      c.methods
        .collect(parseFloat(swapid))
        .send({ amount: parseFloat(price), mutez: true, storageLimit: 350})
        .then((a) => {
          enableButton("collectButton" + objkt_id, "collect");
        })
        .catch((e) => {
          enableButton("collectButton" + objkt_id, "collect");
        })
    );
  }
};

export const batch_collect = async () => {
  const response = await checkIfWalletConnected(wallet);
  let list = [];
  if (response.success) {
    var b_collect = await tezos.wallet.at(MARKET);
    var transactions = window.sepet.map((e) => {
      if (e.status == true){
        list.push({
          kind: OpKind.TRANSACTION,
          ...b_collect.methods.collect(parseFloat(e.swap_id))
          .toTransferParams({ amount: parseFloat(e.price), mutez: true, storageLimit: 350 })
        })
      }
    });
    let batch = await tezos.wallet.batch(list);
    return await batch.send()
    .then((a) => {
      window.sepet = [];
      window.localStorage.setItem("sepet", JSON.stringify(window.sepet));
      window.location = "/";
    })
    .catch((e) => {
      document.getElementById("batch_collect").innerHTML = "collect";
    });
  }
};

export const burn = async (objkt_id, amount) => {
  var ac = await getActiveAccount();
  await tezos.wallet.at(FA2).then(async (c) =>
    c.methods
      .burn(ac.address, parseInt(amount), parseInt(objkt_id))
      .send()
      .then((a) => {
        enableButton("burnButton" + objkt_id, "burn");
      })
      .catch((e) => {
        enableButton("burnButton" + objkt_id, "burn");
      })
  );
};

export const swap = async (objkt_id, objkt_amount, xtz_per_objkt) => {
  var ac = await getActiveAccount();
  const minter_address = `query minter_check($tokenid: bigint = 0) {
    tokens(where: {token_id: {_eq: $tokenid}}) {
      minter_address
    }
  }`;
  async function fetchGraphQL(operationsDoc, operationName, variables) {
    let result = await fetch("https://api.typed.art/v1/graphql", {
      method: "POST",
      header: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    });
    return await result.json();
  }
  var result = await fetchGraphQL(minter_address, "minter_check", {
    tokenid: objkt_id,
  });
  var creator = result.data.tokens[0].minter_address;
  const [objktsContract, marketplaceContract] = await Promise.all([
    tezos.wallet.at(FA2),
    tezos.wallet.at(MARKET),
  ]);
  let list = [
    {
      kind: OpKind.TRANSACTION,
      ...objktsContract.methods
        .update_operators([
          {
            add_operator: {
              operator: MARKET,
              token_id: parseFloat(objkt_id),
              owner: ac.address,
            },
          },
        ])
        .toTransferParams({ amount: 0, mutez: true }),
    },
    {
      kind: OpKind.TRANSACTION,
      ...marketplaceContract.methods
        .swap(
          FA2,
          parseFloat(objkt_id),
          parseFloat(objkt_amount),
          parseFloat(xtz_per_objkt),
          parseFloat(0),
          creator
        )
        .toTransferParams({ amount: 0, mutez: true, storageLimit: 300 }),
    },
    {
      kind: OpKind.TRANSACTION,
      ...objktsContract.methods
        .update_operators([
          {
            remove_operator: {
              operator: MARKET,
              token_id: parseFloat(objkt_id),
              owner: ac.address,
            },
          },
        ])
        .toTransferParams({ amount: 0, mutez: true }),
    },
  ];
  let batch = await tezos.wallet.batch(list);
  return await batch
  .send()
  .then((a) => {
    enableButton("swapButton" + objkt_id, "swap");
  })
  .catch((e) => {
    enableButton("swapButton" + objkt_id, "swap");
  });
};

export const cancel = async (swap_id, objkt_id) => {
  return await tezos.wallet.at(MARKET).then((c) =>
    c.methods
      .cancel_swap(parseFloat(swap_id))
      .send({ amount: 0, storageLimit: 310 })
      .then((e) => {
        enableButton("cancelButton" + objkt_id, "cancel");
      })
      .catch((e) => {
        enableButton("cancelButton" + objkt_id, "cancel");
      })
  );
};

export const register = async (name) => {
  var byte_name = name
    .split("")
    .reduce(
      (hex, c) => (hex += c.charCodeAt(0).toString(16).padStart(2, "0")),
      ""
    );
  return await tezos.wallet
    .at(REGISTER)
    .then((c) => c.methods.register(byte_name).send({ amount: 0 }))
    .then((e) => {
      window.location = "/";
    })
    .catch((e) => {
      enableButton("registerButton", "save");
    });
};
export {
  connectWallet,
  disconnectWallet,
  getActiveAccount,
  checkIfWalletConnected,
  changeButton,
  enableButton,
};
