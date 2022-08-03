export default () => {
  onmessage = e => {
    const { fileData, id } = e.data;
    const fileUrl = fileData.url;
    const fileName = fileData.name;

    fetch(`https://api.panoramas.social/api/room/summary/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(res => {
        return res.json();
      })
      .then(summaryInfo => {
        // parse the info and format it into html

        let html = `<div> Call participants: ${summaryInfo.participants.toString()} <br\> Call duration: ${
          summaryInfo.duration
        }<br/>`;

        if (fileName != "none") {
          const fileHtml = `The host has included the following file for future reference: ${fileName}
            <br/> You can download it <a href=${fileUrl}> here</a>.`;
          html = html + fileHtml;
        }

        html = html + "</div>";

        fetch(`https://api.panoramas.social/api/text-mail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email: summaryInfo.participants, html: html })
        })
          .then(response => response.json())
          .then(data => {
            const success = "success";
            const time = new Date().getTime();

            postMessage({
              success,
              time
            });
          });
      })
      .catch(error => {
        console.error("Error:", error);
        postMessage({
          success: "Worker failed to get summary",
          time: new Date().getTime()
        });
      });
  };
};
