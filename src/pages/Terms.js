import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  return (
    <div className="about">
      <div className="terms">
        <p>Terms and Conditions</p>
        <div className="emptyDiv"></div>
        <p>
          Terms and Conditions can be changed at any time. Please check this
          page regularly to be up to date.
        </p>
        <p>
          Typed is a text-based art platform where people can mint and collect
          story, poems, ASCII, and similar types of text-based art. The tokens
          are called typed and they are stored on Tezos Blockchain. The content
          of the token is stored in IPFS.
        </p>
        <p>
          Please read carefully and understand the Terms and Conditions before
          using the platform. If you have any questions, you can contact us via
          e-mail or join our discord server. If you start using the platform,
          you are deemed to read and agreed to the Terms and Conditions.
        </p>
        <p>
          Typed is only for minting and collecting text-based art and doesn’t
          allow any other types of use including any illegal activities. If
          users have improperly used the platform for any purpose other than
          described, the users will be held accountable not the platform.
        </p>
        <p>
          The art on Typed is user-created and some of them might not be
          suitable for all ages. If you are underaged, don’t use the platform
          without your legal guardians.
        </p>
        <div className="emptyDiv"></div>
        <p>
          Users must comply with the following principles when using the
          platform:
        </p>
        <p>- Comply with the Terms and Conditions.</p>
        <p>- Do not use the website services for any illegal purpose.</p>
        <p>- Do not mint or swap any content that you are not the owner of.</p>
        <p>- Do not mint or swap any illegal content.</p>
        <p>- Do not mint or swap any discrimination or hatred remarks.</p>
        <p>- Do not infringe a copyright or any right in any way.</p>
        <p>- Do not impersonate or use misleading usernames.</p>
        <p>- Do not spam.</p>
        <div className="emptyDiv"></div>
        <p>
          Users who have violated anything mentioned here will be held fully
          responsible for the consequences without holding the platform
          accountable.
        </p>
        <p>
          Typed may ban a token or a user from the platform if the user violated
          the Terms and Conditions. If you or your token is banned from the
          platform, please join our discord to get more information.
        </p>
        <p>
          Typed is a very new and experimental project. You may encounter bugs,
          the whole platform can go down and disappear or there might be updates
          that can break things for you. Please use it at your own risk.
        </p>
        <p>Thank you!</p>
      </div>
    </div>
  );
};

export default Terms;
