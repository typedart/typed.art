import Token from "../components/Token";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getActiveAccount } from "../utils/wallet";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";

const Feed = ({ query }) => {
  const [BannedWallets, setBannedWallets] = useState([]);
  const [BannedTokens, setBannedTokens] = useState([]);
  const [tokens, setTokens] = useState([]);

  const [loadMore, setLoadMore] = useState(true);
  const startFrom = useRef(9999999);

  let { tokenID } = useParams();
  let { tag } = useParams();

  const tagQuery =
    `query LatestFeed($lastId: bigint = 999999, $wallet: String = "tz1by8wErRheEJ8GSwrUKf9rYEsJQWL6kqYm") {
    tokens(limit: 10, order_by: {token_id: desc}, where: {token_id: {_lte: $lastId}, tags: {tag: {_eq: "` +
    tag +
    `"}}, description: {_neq: ""}, editions: {_gt: "0"}}) {
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

  if (query === "tagQuery") query = tagQuery;

  let wallet = "";

  async function fetchFeed(lastId, wallet) {
    await axios
      .get("filters/wallet.json")
      .then((res) => {
        setBannedWallets(res.data);
      })
      .catch((err) => console.log(err));
    await axios
      .get("filters/token.json")
      .then((res) => {
        setBannedTokens(res.data);
      })
      .catch((err) => console.log(err));
    const { errors, data } = await fetchGraphQL(query, "LatestFeed", {
      lastId: lastId,
      wallet: wallet,
    });
    if (errors) {
      console.error(errors);
    } else {
      let result = [];

      data !== undefined && (result = data.tokens);
      //console.log(result);
      if (result.length <= 0) {
        startFrom.current = 0;
        setLoadMore(false);
      } else startFrom.current = result[result.length - 1].token_id - 1;
      //console.log(startFrom.current);
      return result;
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

  const getUserWallet = async () => {
    const account = await getActiveAccount();
    if (account) {
      wallet = account.address;
    }
    getTokens();
  };

  const getTokens = async () => {
    const tokensFromServer = await fetchFeed(startFrom.current, wallet);
    setTokens([...tokens, ...tokensFromServer]);
    //console.log(tokens);
  };

  useEffect(() => {
    startFrom.current = 99999999999;
    if (Number(tokenID) >= 0) {
      startFrom.current = Number(tokenID);
    }
    next();
  }, []);

  const next = () => {
    getUserWallet();
  };

  return (
    <div className="feed">
      <InfiniteScroll
        dataLength={tokens.length}
        next={next}
        hasMore={loadMore}
        loader={<p className="loadingText">waiting...</p>}
      >
        {tokens.map((token) =>
          !BannedTokens.includes(token.token_id) &
          (!BannedWallets.includes(token.minter_address) === true) ? (
            <Token
              selected={Number(tokenID)}
              key={token.token_id}
              token={token}
            />
          ) : (
            ""
          )
        )}
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
