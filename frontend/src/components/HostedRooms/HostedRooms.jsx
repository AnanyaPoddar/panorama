import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";

const HostedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const { user } = useContext(AuthContext);

  // check for rooms that user is host of
  console.log(user.email);
  useEffect(() => {
    fetch(`http://localhost:5000/api/room/hosted`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.email,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);
      })
      .catch((err) => console.log(err));
  }, []);


  return (
    <div>
      {rooms}
    </div>
  );
};

export default HostedRooms;
