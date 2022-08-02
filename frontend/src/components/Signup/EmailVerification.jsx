import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const EmailVerification = () => {
  const [validUrl, setValidUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  const param = useParams();

  useEffect(() => {
    const verifyEmailUrl = () => {
      fetch(`http://localhost:5000/api/${param.id}/verify/${param.token}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          setLoading(false);
          if (res.status===200) {
            setValidUrl(true);
          }
          else { 
          setValidUrl(false);
          }
          return res.json();
        })
        .then((json) => {
          return;
        })
        .catch((err) => {
          
          setLoading(false);
          setValidUrl(false);
        });
    };
    verifyEmailUrl();
  }, [param]);

  return (
    <div>
      {loading ? (
        <div className="msg">
          <h1>Loading...</h1>
        </div>
      ):(validUrl ? (
          <div className="msg">
            <h1>Email verified successfully. You may now close this tab.</h1>
          </div>
        ) : (
          <div className="msg">
            <h1>404 Not Found</h1>
          </div>
        )
      )}
        
    </div>
  );
};

export default EmailVerification;
