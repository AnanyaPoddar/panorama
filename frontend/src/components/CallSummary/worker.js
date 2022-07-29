// worker script
export default () => {
  onmessage = e => {
    let { emails, names } = e.data;
    console.log(e.data);
    console.log("in worler", emails);

    let html = `Attendees: ${names}<br/>`;
    let to = { email: emails, html: html };

    fetch(`https://panoramas.social:5000/api/text-mail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(to)
    })
      .then(response => response.json())
      .then(data => {
        const success = "success";
        const time = new Date().getTime();
        console.log("done in worker");

        postMessage({
          success,
          time
        });
      })
      .catch(error => {
        console.error("Error:", error);
      });
  };
};
