import React, { useEffect, useState } from "react";

export const Holders = ({ id }) => {
  const query = `query holders ($token_id: bigint = 0) {
    tokens(order_by: {}, where: {token_id: {_eq: $token_id}}) {
      holders(where: {holder_address: {_neq: "KT1VoZeuBMJF6vxtLqEFMoc4no5VDG789D7z"}, amount: {_gt: "0"}}, order_by: {amount: desc}) {
        userprofile {
          user_name
        }
        holder_address
        amount
      }
    }
  }
  
  `;

  const shrinkWalletAddress = (address) => {
    return address.substr(0, 5) + "…" + address.substr(-5);
  };
  const shrinkUserName = (username) => {
    return username.length > 20 ? username.substr(0, 20) + "…" : username;
  };

  const [holders, setHolders] = useState();

  useEffect(() => {
    fetchHolder();
  }, []);

  async function fetchHolder() {
    const { errors, data } = await fetchGraphQL(query, "holders", {
      token_id: id,
    });
    if (errors) {
      console.error(errors);
    } else {
      if (data !== undefined) {
        setHolders(data.tokens[0].holders);
      }
    }
  }

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

  if (holders !== undefined) {
    return holders.map((holders, index) => (
      <div key={index} className="holderInfo">
        <div className="holderName">
          {" "}
          <a
            href={
              holders.userprofile !== null
                ? "@" + holders.userprofile.user_name
                : holders.holder_address
            }
            target="_blank"
            rel="noreferrer"
          >
            {holders.userprofile !== null
              ? shrinkUserName(holders.userprofile.user_name)
              : shrinkWalletAddress(holders.holder_address)}
          </a>
        </div>
        <div className="holderAmount">[{holders.amount}]</div>
      </div>
    ));
  }
};
