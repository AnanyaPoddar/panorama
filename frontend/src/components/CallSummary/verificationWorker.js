// worker script for sending verification mail
export default () => {
  onmessage = e => {
    let { emails } = e.data;
    fetch(`http://localhost:5000/api/verification-mail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ identity: emails })
    })
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then(data => {
        const success = "success";
        const time = new Date().getTime();
        postMessage({
          success,
          time
        });
      })
      .catch(error => {
        console.error("Error:", error);
        postMessage({
          success: "Worker failed to send verification",
          time: new Date().getTime()
        });
      });
  };
};
