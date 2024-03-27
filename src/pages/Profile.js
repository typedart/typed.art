import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Feed from "./Feed";
import { getActiveAccount, register, changeButton } from "../utils/wallet";

const Profile = () => {
  let { user } = useParams();
  let { username } = useParams();
  const [show, setShow] = useState(-1);
  const [edit, setEdit] = useState(false);
  const [wallet, setWallet] = useState();
  const [userWallet, setUserWallet] = useState("");

  const userQuery = `query getUser ($username: String=""){
    userlist(where: {user_name: {_eq: $username}}) {
      wallet_address
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

  async function userNameWallet() {
    const { errors, data } = await fetchGraphQL(userQuery, "getUser", {
      username: username,
    });
    if (errors) {
      console.error(errors);
    } else {
      let result = [];
      data !== undefined && (result = data.userlist);
      if (result.length <= 0) {
        setUserWallet(user);
        setShow(0);
      } else {
        setUserWallet(result[0].wallet_address.slice(2));
        setShow(0);
      }
    }
  }

  const getUserWallet = async () => {
    const account = await getActiveAccount();
    const address = account !== undefined ? account.address : "";
    setWallet(address);
    userNameWallet();
  };
  useEffect(() => {
    getUserWallet();
  }, []);

  //latin alfabesi disinda kullanici adi almasini engeller
  var handleChange = (e) => {
    if (!e.target.checkValidity()) {
      console.log(e.target.pattern);
      e.target.value = e.target.value.replace(/[^A-Za-z0-9-._]/g, "");
    }
  };

  const typed =
    `query LatestFeed($lastId: bigint = 999999, $wallet: String = "tz1VZUTpbJQiQZvpXE9kTCydgyTTxpW49G5o") {
      tokens(order_by: {token_id: desc}, limit: 10, where: {token_id: {_lte: $lastId}, description: {_neq: ""}, editions: {_gt: "0"}, minter_address: {_eq:  "tz` +
    userWallet +
    `"}}) {
        token_id
        editions
        minter_address
        description
        tags {
          tag
        }
        userprofile {
          user_name
        }
        swaps_aggregate {
          aggregate {
            min {
              price
            }
            sum {
              amount_left
              swap_id
            }
          }
        }
        holders_aggregate(where: {holder_address: {_eq: $wallet}}) {
          aggregate {
            avg {
              amount
            }
          }
        }
        swaps(order_by: {price: asc}, limit: 1) {
          swap_id
          price
          token {
            swaps(where: {seller_address: {_eq: $wallet}}, limit: 1, order_by: {price: asc}) {
              swap_id
              seller_address
              price
            }
          }
        }
      }
    }
  
  `;

  const collected =
    `query LatestFeed($lastId: bigint = 999999, $wallet: String = "tz1VZUTpbJQiQZvpXE9kTCydgyTTxpW49G5o", $profileWallet: String = "tz` +
    userWallet +
    `") {
      tokens(order_by: {token_id: desc}, limit: 10, where: { minter_address: {_neq: $profileWallet}, token_id: {_lte: $lastId},description: {_neq: ""},editions: {_gt: "0"},
        _or:[
        { swaps: {seller_address: {_eq: $profileWallet}}}, 
        {holders: {holder_address: {_eq: $profileWallet}, amount: {_gt: "0"}}}
      ]
      }
      ) {
        token_id
        editions
        minter_address
        description
        tags {
          tag
        }
        userprofile {
          user_name
        }
        swaps_aggregate {
          aggregate {
            min {
              price
            }
            sum {
              amount_left
              swap_id
            }
          }
        }
        holders_aggregate(where: {holder_address: {_eq: $wallet}}) {
          aggregate {
            avg {
              amount
            }
          }
        }
        swaps(order_by: {price: asc}, limit: 1) {
          swap_id
          price
          token {
            swaps(where: {seller_address: {_eq: $wallet}}, limit: 1, order_by: {price: asc}) {
              swap_id
              seller_address
              price
            }
          }
        }
      }
    }
    
  `;

  const shrinkWalletAddress = (address) => {
    return address.substr(0, 5) + "…" + address.substr(-5);
  };

  window.scroll(0, 0);

  return (
    <div className="profilePage">
      <div className="profileTop">
        <div className="profileTopLeft">
          {edit && (
            <div className="usernameEdit">
              <input
                id="registery"
                maxLength="20"
                placeholder="username"
                pattern="^[A-Za-z0-9-._]*$"
                onChange={handleChange}
              ></input>
              <button
                id="registerButton"
                onClick={() => {
                  if (document.getElementById("registery").value !== "") {
                    changeButton("registerButton");
                    register(document.getElementById("registery").value);
                  } else alert("username?");
                }}
              >
                save
              </button>
            </div>
          )}
          {!edit && (
            <p>
              <a
                href={"https://tzkt.io/tz" + userWallet}
                target="_blank"
                rel="noreferrer"
              >
                {username === undefined
                  ? shrinkWalletAddress("tz" + userWallet)
                  : username}
              </a>
            </p>
          )}
          <p>
            {(wallet === "tz" + userWallet) & (!edit === true) ? (
              <button
                className="userNameEditButton"
                onClick={() => {
                  setEdit(true);
                }}
              >
                edit
              </button>
            ) : (
              ""
            )}
          </p>
        </div>

        <div className="profileTopRight">
          <p>
            <button
              disabled={show === 0 ? true : false}
              onClick={() => {
                setShow(0);
              }}
            >
              typed
            </button>
          </p>
          <p>
            <button
              disabled={show === 1 ? true : false}
              onClick={() => {
                setShow(1);
              }}
            >
              collected
            </button>
          </p>
        </div>
      </div>

      <div className="profileFeed">
        {show === 0 && <Feed query={typed} />}
        {show === 1 && <Feed query={collected} />}
      </div>
    </div>
  );
};

export default Profile;
