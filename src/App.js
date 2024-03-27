import Header from "./components/Header";
import Feed from "./pages/Feed";
import About from "./pages/About";
import Mint from "./pages/Mint";
import Terms from "./pages/Terms";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Profile from "./pages/Profile";

const query = `query LatestFeed($lastId: bigint = 999999, $wallet: String = "tz1by8wErRheEJ8GSwrUKf9rYEsJQWL6kqYm") {
  tokens(limit: 10, order_by: {token_id: desc}, where: {token_id: {_lte: $lastId}, description: {_neq: ""}, editions: {_gt: "0"}}) {
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

function App() {
  return (
    <div className="screen">
      <Router>
        <Header />
        <div className="page">
          <Routes>
            <Route path="/" element={<Feed query={query} />} />
            <Route exact path="/-:tag" element={<Feed query={"tagQuery"} />} />
            <Route exact path="/:tokenID" element={<Feed query={query} />} />
            <Route exact path="/@:username" element={<Profile />} />
            <Route exact path="/tz:user" element={<Profile />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
