import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  return (
    <div className="about">
      <p>- typed: text-based nft platform [v0.3.0 beta]</p>
      <p>
        - discord:{" "}
        <a
          href="https://discord.gg/xVnffHyBT5"
          target="_blank"
          rel="noreferrer"
        >
          typed
        </a>
      </p>
      <p>
        - twitter:{" "}
        <a
          href="https://twitter.com/typed_art"
          target="_blank"
          rel="noreferrer"
        >
          @typed_art
        </a>
      </p>
      <p>
        - email:{" "}
        <a
          href="mailto:typedart@protonmail.com"
          target="_blank"
          rel="noreferrer"
        >
          typedart@protonmail.com
        </a>
      </p>
      <p>
        - contracts:{" "}
        <a
          href="https://tzkt.io/KT1J6NY5AU61GzUX51n59wwiZcGJ9DrNTwbK"
          target="_blank"
          rel="noreferrer"
        >
          fa2
        </a>
        ,{" "}
        <a
          href="https://tzkt.io/KT1CK9RnWZGnejBeT6gJfgvf4p7f1NwhP9wS"
          target="_blank"
          rel="noreferrer"
        >
          minter
        </a>
        ,{" "}
        <a
          href="https://tzkt.io/KT1VoZeuBMJF6vxtLqEFMoc4no5VDG789D7z"
          target="_blank"
          rel="noreferrer"
        >
          market
        </a>
        ,{" "}
        <a
          href="https://tzkt.io/KT1QSERFwHZcQfUf6ZruTSLMBfzitRs6ixmP"
          target="_blank"
          rel="noreferrer"
        >
          register
        </a>
      </p>
      <p>- royalty: 10%</p>
      <p>- fee: 5%</p>
      <div className="emptyDiv"></div>

      <div>
        <a href="/terms" target="_blank" rel="noreferrer">
          terms and conditions
        </a>
        <p>
          * you can report a token via{" "}
          <a
            href="mailto:typedart@protonmail.com"
            target="_blank"
            rel="noreferrer"
          >
            email
          </a>{" "}
          or{" "}
          <a
            href="https://discord.gg/xVnffHyBT5"
            target="_blank"
            rel="noreferrer"
          >
            typed discord
          </a>
        </p>
      </div>

      <div className="emptyDiv"></div>
      <p>- tips:</p>
      <div className="aboutTips">
        <p>* you can set your username and url from the profile page</p>
        <p>* token urls: typedX&lt;text&gt; (X is the token id)</p>
        <p>* tags: tag&lt;tag1, tag2&gt; (beginning of the mint, max 5)</p>
        <p>
          * tag feed: typed.art/-X (X is the tag, we can use this as categories)
        </p>
        <p>* special tags:</p>
        <p className="specialTags">+ monospace: makes the font monospace</p>
        <p className="specialTags">
          + nowrap: text won't wrap on smaller windows
        </p>
        <p className="specialTags">+ nsfw: adds [nsfw] to the more button</p>
      </div>
      <div className="emptyDiv"></div>
      <p>
        <a href="https://tzkt.io/" target="_blank" rel="noreferrer">
          built with tzkt api
        </a>
      </p>
    </div>
  );
};

export default About;
