import { useState, useEffect, useRef } from "react";
import { collect, burn, swap, cancel, changeButton } from "../utils/wallet";
import axios from "axios";
import reactStringReplace from "react-string-replace";
import { Holders } from "./Holders";

window.sepet = [];
const Token = ({ token, selected }) => {
  const shrinkWalletAddress = (address) => {
    return tzp !== ""
      ? String(tzp)
      : address.substr(0, 5) + "…" + address.substr(-5);
  };
  const shrinkUserName = (username) => {
    return username.length > 20 ? username.substr(0, 20) + "…" : username;
  };

  const tzProfiles = async () => {
    token.userprofile !== null
      ? setTzp(token.userprofile.user_name)
      : setTzp(await GetUserMetadata(token.minter_address));
  };

  const clamp = true;
  const containerRef = useRef(null);
  const [showMoreButton, setShowMoreButton] = useState([]);
  const [show, setShow] = useState(0);
  const [tzp, setTzp] = useState("");
  const [market, setMarket] = useState(0);
  const GetUserClaims = async (walletAddr) => {
    return await axios.post("https://indexer.tzprofiles.com/v1/graphql", {
      query: `query MyQuery { tzprofiles_by_pk(account: "${walletAddr}") { valid_claims } }`,
      variables: null,
      operationName: "MyQuery",
    });
  };

  const GetUserMetadata = async (walletAddr) => {
    let tzpData = {};
    try {
      let claims = await GetUserClaims(walletAddr);
      if (claims.data.data.tzprofiles_by_pk !== null)
        for (const claim of claims.data.data.tzprofiles_by_pk.valid_claims) {
          let claimJSON = JSON.parse(claim[1]);
          if (claimJSON.type.includes("BasicProfile")) {
            if (claimJSON.credentialSubject.alias !== "")
              tzpData["alias"] = claimJSON.credentialSubject.alias;
            tzpData["tzprofile"] = walletAddr;
          }
        }
    } catch (e) {
      console.error(e, e.stack);
    }
    return tzpData.alias !== undefined ? tzpData.alias : "";
  };
  const CartAddItem = (id) => {
    let check = document.getElementById(id);
    if (check !== null) return;
    let a = document.getElementById("list");
    let xd = document.getElementById("list");
    let theFirstChild = xd.firstChild;
    let li = document.createElement("a");
    li.href = "/" + id;
    li.innerText = id + "#";
    li.id = id;
    li.onclick = function () {
      //CartRemoveItem(this.id,true);
    };
    xd.insertBefore(li, theFirstChild);
  };
  const check_item = (id) => {
    try {
      if (
        JSON.parse(localStorage.getItem("sepet")).filter(
          (x) => x.id === id
        )[0] === undefined
      ) {
        return false;
      } else {
        if (
          JSON.parse(localStorage.getItem("sepet")).filter(
            (x) => x.id === id
          )[0].status === true
        ) {
          return true;
        } else {
          return false;
        }
      }
    } catch (e) {
      return false;
    }
  };
  const CartRemoveItem = (id, f) => {
    if (f == true) {
      window.sepet = JSON.parse(window.localStorage.getItem("sepet"));
      var a = document.getElementById("list");
      var item = document.getElementById(id);
      a.removeChild(item);
      setMarket(0);
      let silme = window.sepet.find((e) => e.id == id);
      silme.status = false;
      let count = window.sepet.filter((a) => a.status == true).length;
      document.getElementById("cart").innerHTML = "collect[" + count + "]";
      window.localStorage.setItem("sepet", JSON.stringify(window.sepet));
      if (count == 0) document.getElementById("cart").style.display = "none";
    } else {
      var a = document.getElementById("list");
      var item = document.getElementById(id);
      try {
        a.removeChild(item);
      } catch (e) {
        console.log(e);
      }
    }
  };
  useEffect(() => {
    tzProfiles();
  }, []);

  useEffect(() => {
    const hasClamping = (e) => {
      const { clientHeight, scrollHeight } = e;
      return clientHeight !== scrollHeight;
    };

    const checkButtonAvailability = () => {
      setShowMoreButton(hasClamping(containerRef.current));
    };

    // this is for not firing button check everythick when resize
    var resizeTimer;
    const resizeFunction = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkButtonAvailability, 250);
    };
    window.addEventListener("resize", resizeFunction);
    checkButtonAvailability();
    return () => {
      window.removeEventListener("resize", resizeFunction);
    };
  }, [containerRef]);

  useEffect(() => {
    let a = window.localStorage.getItem("sepet");
    if (a === null) {
      window.sepet = [];
    } else {
      window.sepet = JSON.parse(window.localStorage.getItem("sepet"));
      for (var i = 0; i < window.sepet.length; i++) {
        let item = document.getElementById(window.sepet[i].id);

        if (window.sepet[i].status == true && item === null) {
          let a = document.getElementById("list");
          let xd = document.getElementById("list");
          let theFirstChild = xd.firstChild;
          let li = document.createElement("a");
          li.href = "/" + window.sepet[i].id;
          li.innerText = window.sepet[i].id + "#";
          li.id = window.sepet[i].id;
          li.onclick = function () {
            //CartRemoveItem(this.id,true);
          };
          xd.insertBefore(li, theFirstChild);
          let count = window.sepet.filter((a) => a.status == true).length;
          document.getElementById("cart").innerHTML = "collect[" + count + "]";
        }
      }
    }
  }, []);
  useEffect(() => {
    let count = window.sepet.filter((a) => a.status == true).length;
    if (count == 0) {
      document.getElementById("cart").style.display = "none";
    } else {
      document.getElementById("cart").style.display = "inline";
    }
    if (check_item(id) === false) {
      setMarket(0);
    } else {
      setMarket(3);
    }
  });

  const [clamped, setClamped] = useState(clamp);
  const viewMore = () => {
    setClamped(false);
    setShowMoreButton(false);
  };

  //about the token
  const id = token.token_id;
  const creatorName =
    token.userprofile !== null ? token.userprofile.user_name : "";
  const creatorAddress = token.minter_address;
  const typed = token.description;
  const supply = token.editions;
  const tagObject = token.tags;
  const tag =
    tagObject !== null &&
    tagObject.map(function (t) {
      return t["tag"];
    });
  const liveSwapCount = token.swaps_aggregate.aggregate.sum.amount_left;
  const minPriceMutez = token.swaps_aggregate.aggregate.min.price;
  const youHave = token.holders_aggregate.aggregate.avg.amount;
  var youSwapped = "";
  var mintSwapId = "";
  var cancelSwapId = "";
  try {
    if (token.swaps.length > 0) {
      mintSwapId = token.swaps[0].swap_id;
      if (token.swaps[0].token.swaps.length > 0) {
        youSwapped = token.swaps[0].token.swaps.length;
        cancelSwapId = token.swaps[0].token.swaps[0].swap_id;
      }
    }
  } catch (e) {
    youSwapped = token.swaps.length;
    cancelSwapId = token.swaps[0].swap_id;
  }

  const editionNumber = (number) => {
    number = parseInt(number);
    if (number > youHave) {
      number = youHave;
    } else if (number < 1) {
      number = 1;
    }
    return number;
  };

  let tokenAreaCSS = "";
  let moreText = "";

  if (tag !== null) {
    if (tag.includes("monospace")) {
      tokenAreaCSS += " tagTokenMonospace";
    }
    if (tag.includes("nowrap")) {
      tokenAreaCSS += " tagTokenNowrap";
    }
    if (tag.includes("nsfw")) {
      moreText = " [nsfw]";
    }
  }

  return (
    <div className="token">
      <div className="token-top">
        <p id="notSelected">
          <a href={creatorName !== "" ? "@" + creatorName : creatorAddress}>
            {creatorName !== ""
              ? shrinkUserName(creatorName)
              : shrinkWalletAddress(creatorAddress)}
          </a>
        </p>
        <div>
          <p id="notSelected">{youHave > 0 && "[" + youHave + "] "}</p>
          <a href={"/" + id} id={id === selected ? "selected" : "notSelected"}>
            {id}#
          </a>
        </div>
      </div>
      <div className="token-mid">
        <p
          className={(clamped ? "clamp" : "notClamped") + tokenAreaCSS}
          ref={containerRef}
        >
          {reactStringReplace(typed, /(typed\d{1,}<.*?>)/g, (match, i) => (
            <a
              href={match.match(/typed(\d{1,})</)[1]}
              target="_blank"
              rel="noreferrer"
            >
              {match.match(/typed\d{1,}<(.*?)>/)[1]}
            </a>
          ))}
        </p>
        {showMoreButton && (
          <button
            onClick={() => {
              viewMore();
            }}
          >
            {"more" + moreText}
          </button>
        )}
      </div>
      <div className="token-bottom">
        <p>
          {liveSwapCount > 0 ? liveSwapCount : 0}/{supply}{" "}
          {liveSwapCount > 0 && "- " + minPriceMutez / 1000000 + " xtz"}
        </p>

        <div className="token-bottom-right">
          {(youHave > 0) & ((show !== 1) === true) ? (
            <p>
              <button
                onClick={() => {
                  setShow(1);
                }}
              >
                swap
              </button>
            </p>
          ) : (
            ""
          )}

          {youSwapped > 0 && (
            <p>
              <button
                id={"cancelButton" + id}
                onClick={() => {
                  changeButton("cancelButton" + id);
                  cancel(cancelSwapId, id);
                }}
              >
                cancel
              </button>
            </p>
          )}

          {(youHave > 0) & ((show !== 2) === true) ? (
            <p>
              <button
                onClick={() => {
                  setShow(2);
                }}
              >
                burn
              </button>
            </p>
          ) : (
            ""
          )}
          {liveSwapCount > 0 && market !== 3 && (
            <p>
              <button
                id={"cart" + id}
                onClick={() => {
                  if (window.localStorage.getItem("sepet") !== null)
                  {
                    window.sepet = JSON.parse(window.localStorage.getItem("sepet"));                    
                  };
                  setMarket(3);
                  let ekleme = window.sepet.find((e) => e.id == id);
                  if (ekleme === undefined) {
                    window.sepet.push({
                      id: id,
                      price: minPriceMutez,
                      swap_id: mintSwapId,
                      status: true,
                    });
                    let count = window.sepet.filter(
                      (a) => a.status == true
                    ).length;
                    document.getElementById("cart").innerHTML =
                      "collect[" + count + "]";
                    CartAddItem(id);
                    window.localStorage.setItem(
                      "sepet",
                      JSON.stringify(window.sepet)
                    );
                  } else {
                    window.sepet = JSON.parse(
                      window.localStorage.getItem("sepet")
                    );
                    let silme = window.sepet.find((e) => e.id == id);
                    silme.status = true;
                    let count = window.sepet.filter(
                      (a) => a.status == true
                    ).length;
                    document.getElementById("cart").innerHTML =
                      "collect[" + count + "]";
                    CartAddItem(id);
                    window.localStorage.setItem(
                      "sepet",
                      JSON.stringify(window.sepet)
                    );
                  }
                }}
              >
                add
              </button>
            </p>
          )}
          {market == 3 && (
            <p>
              <button
                id={"cart" + id}
                onClick={() => {
                  if (window.localStorage.getItem("sepet") !== null)
                  {
                    window.sepet = JSON.parse(window.localStorage.getItem("sepet"));                    
                  };
                  setMarket(0);
                  let silme = window.sepet.find((e) => e.id == id);
                  silme.status = false;
                  let count = window.sepet.filter(
                    (a) => a.status == true
                  ).length;
                  document.getElementById("cart").innerHTML =
                    "collect[" + count + "]";
                  CartRemoveItem(silme.id, false);
                  window.localStorage.setItem(
                    "sepet",
                    JSON.stringify(window.sepet)
                  );
                }}
              >
                remove
              </button>
            </p>
          )}
          {liveSwapCount > 0 && (
            <p>
              <button
                id={"collectButton" + id}
                onClick={() => {
                  changeButton("collectButton" + id);
                  collect(mintSwapId, minPriceMutez, id);
                }}
              >
                collect
              </button>
            </p>
          )}
          {show !== 3 && (
            <p>
              <button
                onClick={() => {
                  setShow(3);
                }}
              >
                +
              </button>
            </p>
          )}
          {show === 3 && (
            <p>
              <button
                onClick={() => {
                  setShow(0);
                }}
              >
                x
              </button>
            </p>
          )}
        </div>
      </div>

      {show === 1 && (
        <div className="swapArea">
          <div className="swapAreaLeft">
            <div className="editions">
              <p>editions:</p>
              <input
                id={"swapeditionAmount" + id}
                className="edition-area"
                type="number"
                placeholder="?"
                onKeyUp={(event) =>
                  (event.target.value = editionNumber(event.target.value))
                }
              ></input>
            </div>
            <div className="editions" id="swapPrice">
              <p>price:</p>
              <input
                id={"swapprice" + id}
                className="edition-area"
                type="number"
                placeholder="?"
              ></input>
            </div>
          </div>
          <button
            id={"swapButton" + id}
            onClick={() => {
              if (
                document.getElementById("swapeditionAmount" + id).value > 0 &&
                document.getElementById("swapprice" + id).value >= 0
              ) {
                changeButton("swapButton" + id);
                swap(
                  id,
                  document.getElementById("swapeditionAmount" + id).value,
                  document.getElementById("swapprice" + id).value * 1000000
                );
              } else alert("edition and price?");
            }}
          >
            swap
          </button>
        </div>
      )}
      {show === 2 && (
        <div className="swapArea">
          <div className="swapAreaLeft">
            <div className="editions">
              <p>editions:</p>
              <input
                id={"editionAmount" + id}
                className="edition-area"
                type="number"
                placeholder="?"
                onKeyUp={(event) =>
                  (event.target.value = editionNumber(event.target.value))
                }
              ></input>
            </div>
          </div>
          <button
            id={"burnButton" + id}
            onClick={() => {
              if (document.getElementById("editionAmount" + id).value > 0) {
                changeButton("burnButton" + id);
                burn(id, document.getElementById("editionAmount" + id).value);
              } else alert("edition?");
            }}
          >
            burn
          </button>
        </div>
      )}
      {show === 3 && (
        <div className="holderArea">
          <div className="holderAreaTitle">holders</div>
          <div className="holdersList">
            <Holders id={id} />
            ...
          </div>
        </div>
      )}
    </div>
  );
};
export default Token;
