import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeBackground() {
  const { theme } = useTheme();

  const getBackgroundSrc = () => {
    switch (theme) {
      case "light":
        return "/AdobeStock_320210543(1).jpeg"; // Static image for low-end PC
      case "unicorn":
        return "/developerappu.mp4"; // Unicorn theme video
      case "dark":
      default:
        return "/videopapplepuink.mp4"; // Dark theme video (default)
    }
  };

  const src = getBackgroundSrc();
  const isVideo = src.endsWith(".mp4");

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {isVideo ? (
        <video
          key={src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <img
          src={src}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
