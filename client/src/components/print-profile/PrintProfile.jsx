import React from "react";

const PrintProfile = () => {
  const handleDownloadImage = async () => {
    const element = document.getElementById("print"),
      canvas = await html2canvas(element),
      data = canvas.toDataURL("image/jpg"),
      link = document.createElement("a");

    link.href = data;
    link.download = "downloaded-image.jpg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      <button type="button" onClick={handleDownloadImage}>
        Download
      </button>
      <div id="print">This will be downloaded as an image</div>
    </>
  );
};
export default PrintProfile;
