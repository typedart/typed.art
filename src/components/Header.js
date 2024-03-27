import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  connectWallet,
  getActiveAccount,
  disconnectWallet,
  batch_collect,
} from "../utils/wallet";

const Header = () => {
  const [theme, setTheme] = useState("dark");
  const [username, setUserName] = useState("");

  const toggleTheme = () => {
    const toggle = theme === "light" ? "dark" : "light";
    window.localStorage.setItem("typedTheme", toggle);
    setTheme(toggle);
  };

  const userQuery = `query getUser($wallet: String = "tz1PgiH1Amk2vk8KeXUX4z65SoeT625g9EZg") {
    userlist(where: {wallet_address: {_eq: $wallet}}) {
      user_name
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

  async function userNameWallet(address) {
    const { errors, data } = await fetchGraphQL(userQuery, "getUser", {
      wallet: address,
    });
    if (errors) {
      console.error(errors);
    } else {
      let result = [];
      data !== undefined && (result = data.userlist);
      if (result.length <= 0) {
      } else {
        setUserName(result[0].user_name);
      }
    }
  }

  const changeTheme = () => {
    const root = document.documentElement;
    const cart_theme = document.querySelector(".dropdown-content");
    if (theme === "light") {
      root.style.setProperty("--bg", "#f7f7f7");
      root.style.setProperty("--text", "#000");
      root.style.setProperty("--vis10", "#a5a5a5");
      cart_theme.style.setProperty("background-color", "#f7f7f7");
    } else {
      root.style.setProperty("--bg", "#111");
      root.style.setProperty("--text", "#fff");
      root.style.setProperty("--vis10", "#555");
      cart_theme.style.setProperty("background-color", "#111");
    }
  };

  const location = useLocation();
  const [wallet, setWallet] = useState(null);

  const handleConnectWallet = async () => {
    const { wallet } = await connectWallet();
    setWallet(wallet);
  };
  const handleDisconnectWallet = async () => {
    const { wallet } = await disconnectWallet();
    setWallet(wallet);
  };

  useEffect(() => {
    changeTheme();
  }, [theme]);

  useEffect(() => {
    setTheme(window.localStorage.getItem("typedTheme"));
    const func = async () => {
      const account = await getActiveAccount();
      if (account) {
        setWallet(account.address);
        userNameWallet(account.address);
      }
    };
    func();
  }, []);
  return (
    <header className="header">
      <div className="logo">
        <a href="/">typed</a>
        <div className="nav-buttons">
          <button
            id="theme-button"
            onClick={() => {
              toggleTheme();
            }}
          >
            o
          </button>
        </div>
      </div>
      <div className="nav">
        {
          <div className="nav-buttons">
            <div className="dropdown">
              <a id="cart" className="dropbtn"></a>
              <div className="dropdown-content" id="list">
                <button
                  id="batch_collect"
                  onClick={() => {
                    if (
                      document.getElementById("batch_collect").innerHTML ==
                      "waiting..."
                    ) {
                      return 0;
                    } else {
                      batch_collect();
                      document.getElementById("batch_collect").innerHTML =
                        "waiting...";
                    }
                  }}
                >
                  collect
                </button>
              </div>
            </div>
          </div>
        }
        {wallet !== null && (
          <div className="nav-buttons">
            <a href={username === "" ? wallet : "@" + username}>profile</a>
          </div>
        )}

        {wallet !== null && (
          <div className="nav-buttons">
            {location.pathname === "/mint" ? (
              "mint"
            ) : (
              <Link to="mint">mint</Link>
            )}
          </div>
        )}

        <div className="nav-buttons">
          {location.pathname === "/about" ? (
            "about"
          ) : (
            <Link to="about">about</Link>
          )}
        </div>
        <div className="nav-buttons">
          {location.pathname === "/terms" ? (
            "terms"
          ) : (
            <Link to="terms">terms</Link>
          )}
        </div>
        <div className="nav-buttons">
          {wallet !== null ? (
            <button
              onClick={() => {
                handleDisconnectWallet();
              }}
            >
              x
            </button>
          ) : (
            <button
              onClick={() => {
                handleConnectWallet();
              }}
            >
              sync
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
