import { FaFacebookF, FaInstagram, FaTwitter ,FaGoogle} from "react-icons/fa";
import "./SocialIcons.css";

export default function SocialIcons({ onlyAuth = false }) {
  return (
    <div className="social-icons">
      <a href="/" className="icon-btn">
        <FaFacebookF size={22} />
      </a>

   {onlyAuth ? (
        <a href="/" className="icon-btn">
          <FaGoogle size={22} />
        </a>
      ) : (
        <>
          <a href="/" className="icon-btn">
            <FaInstagram size={22} />
          </a>
          <a href="/" className="icon-btn">
            <FaTwitter size={22} />
          </a>
        </>
      )}
    </div>
  );
}