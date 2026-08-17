import { useState } from "react";
import { MdArrowOutward, MdVisibility } from "react-icons/md";

interface Props {
  image: string;
  alt?: string;
  video?: string;
  link?: string;
  onOpen?: () => void;
}

const WorkImage = (props: Props) => {
  const [isVideo, setIsVideo] = useState(false);
  const [video, setVideo] = useState("");

  const handleMouseEnter = async () => {
    if (props.video) {
      setIsVideo(true);
      const response = await fetch(`src/assets/${props.video}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideo(blobUrl);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (props.onOpen) {
      e.preventDefault();
      props.onOpen();
    }
  };

  return (
    <div className="work-image" onClick={handleClick}>
      <a
        className="work-image-in"
        href={props.link || "#"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVideo(false)}
        target={props.link ? "_blank" : undefined}
        rel="noreferrer"
        data-cursor={"disable"}
      >
        <div className="work-link">
          {props.link ? <MdArrowOutward /> : <MdVisibility />}
        </div>
        <img src={props.image} alt={props.alt} />
        {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
      </a>
    </div>
  );
};

export default WorkImage;
