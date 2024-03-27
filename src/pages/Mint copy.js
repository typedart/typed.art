import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useState } from "react";
import { getActiveAccount, changeButton, typed_mint } from "../utils/wallet";
import fetch from "node-fetch";
async function thumbnail(txt, monospace) {
  var f = "32px Arial";
  if (monospace == true) f = "32px IBM Plex Mono";
  var createContext = function (width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
  };
  var c = createContext(512, 512);
  c.filter = "grayscale(100%)";
  if (txt.length >= 0) {
    var dize = [];
    var lines = txt.split("\n");
    dize = lines;
    c.font = f;
    var x = 0;
    var y = 32;
    var lineheight = 32;
    var result = dize.reduce((r, e) => (c.measureText(r).width < c.measureText(e).width ? e : r), "");
    if (result.length > 130) {
      c.canvas.width = 512;
      c.canvas.height = 512;
    } else {
      c.canvas.width = c.measureText(result).width;
      c.canvas.height = lineheight * dize.length + 12;
    }
    c.fillStyle = "#111";
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.font = f;
    c.filter = "grayscale(100%)";
    c.fillStyle = "white";
    if (c.canvas.width == 512) {
      let s = lines[0].substring(0, 20);
      c.fillText(s + "...", 32, 256);
    } else {
      for (var i = 0; i < lines.length; i++) {
        c.fillText(lines[i], x, y + i * lineheight);
      }
    }
    var ca = createContext(512, 512);
    ca.fillStyle = "#111";
    ca.fillRect(0, 0, 512, 512);
    var cerceve = createContext(512, 512);
    var cImage = new Image();
    var img = new Image();
    return new Promise((resolve, reject) => {
      img.src = c.canvas.toDataURL("png");
      //console.log(img.src);
      img.onload = function () {
        ca.imageSmoothingEnabled = true;
        ca.width = 512;
        ca.height = 512;
        var hRatio = ca.width / img.width;
        var vRatio = ca.height / img.height;
        var ratio = Math.min(hRatio, vRatio);
        var centerShift_x = (ca.width - img.width * ratio) / 2;
        var centerShift_y = (ca.height - img.height * ratio) / 2;
        ca.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio
        );
        var t = ca.canvas.toDataURL("png");
        cImage.src = t;
        cImage.onload = function () {
          cerceve.fillStyle = "#111";
          cerceve.fillRect(0, 0, 512, 512);
          cerceve.drawImage(cImage, 0, 0, 512, 512, 16, 16, 512 - 32, 512 - 32);
          var ctx = cerceve.canvas.toDataURL("png");
          resolve(ctx);
        };
      };
    });
  } else {
    console.log("thumbnail gerek yok");
    return false;
  }
}

const Mint = () => {
  const [charLeft, setCharLeft] = useState([9999]);
  const [tag, setTag] = useState(null);

  let mintAreaCSS = "";

  if (tag !== null) {
    if (tag.includes("monospace")) {
      mintAreaCSS += " tagMintMonospace";
    }
    if (tag.includes("nowrap")) {
      mintAreaCSS += " tagMintNowrap";
    }
  }
  const minTextChange = (text) => {
    setCharLeft(9999 - text.length);
    if (text.startsWith("tag<") & (tag === null)) {
      const tagText = text.match(/tag<(.*)>/);
      if (tagText !== null) {
        setTag(
          tagText[1]
            .toLowerCase()
            .replace(/[^a-zA-Z0-9,]/g, "")
            .split(",")
            .slice(0, 5)
        );
        document.getElementById("typedText").value = "";
      }
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  //console.log(mintAreaCSS);

  const editionNumber = (number) => {
    number = parseInt(number);
    if (number > 9999) {
      number = 9999;
    } else if (number < 1) {
      number = 1;
    }
    return number;
  };
  return (
    <div className="mintPage">
      <div className="mint-top">
        <p id="mintTags">
          {tag !== null && tag.join(", ")}{" "}
          {tag !== null && (
            <button
              id="mintTagsCancel"
              onClick={() => {
                setTag(null);
              }}
            >
              x
            </button>
          )}
        </p>
        <p>{charLeft}</p>
      </div>
      <TextareaAutosize
        id="typedText"
        onChange={(event) => minTextChange(event.target.value)}
        className={"mint-area" + mintAreaCSS}
        placeholder="type here"
        maxLength="9999"
      />
      <div className="mint-bottom">
        <div className="editions">
          <p>editions:</p>
          <input
            id="editionAmount"
            className="edition-area"
            type="number"
            placeholder="1 - 9999"
            onKeyUp={(event) =>
              (event.target.value = editionNumber(event.target.value))
            }
          ></input>
        </div>
        <p>
          <button
            id="mintButton"
            onClick={() => {
              if (document.getElementById("editionAmount").value > 0) {
                changeButton("mintButton");
                var tboolean = false;
                if (tag !== null) {
                  const tag_check = tag.find(
                    (element) => element == "monospace"
                  );
                  if (tag_check !== undefined) {
                    tboolean = true;
                  } else {
                    tboolean = false;
                  }
                } else {
                  tboolean = false;
                }
                thumbnail(
                  document.getElementById("typedText").value,
                  tboolean
                ).then((a) => {
                  var t = "";
                  if (a !== false) t = a;
                  mint(
                    document.getElementById("typedText").value,
                    document.getElementById("editionAmount").value,
                    tag,
                    t
                  );
                });
              } else alert("editions?");
            }}
          >
            mint
          </button>
        </p>
      </div>
      <div></div>
    </div>
  );
};

//mint function
const mint = async (text, editions, tag, thum) => {
  const account = await getActiveAccount();
  if (account) {
    var t = text.substring(0, 20) + "...";
    var ta = tag !== null ? tag.join(",") : ""; //buraya tag icerigi gelcek
    var tags = ta.replace(/\s/g, "").split(","); //burasi ipfsye gonderilecek
    var data = {
      name: t,
      address: account.address,
      content: text,
      tag: tags,
      thumbnail: thum,
    };
    var options = {
      method: "post",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": `application/json`,
      },
    };
    fetch("/ipfs", options)
      .then((a) => a.text())
      .then((a) => {
        var tt = a.substring(2, 48);
        if (tt.includes("Qm")) {
          typed_mint(editions, tt);
        } else {
          console.log("hata");
        }
      });
  }
};

export default Mint;
