import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const EmailVerification = () => {
	const [validUrl, setValidUrl] = useState(false);
	const param = useParams();

	useEffect(() => {
		const verifyEmailUrl = () => {
      fetch(`http://localhost:5000/api/${param.id}/verify/${param.token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
      })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);
				setValidUrl(true);
      })
      .catch((err) => {
				setValidUrl(false);
			});
    }
		verifyEmailUrl();
	}, [param]);

	return (
		<div>
			{validUrl ? (
				<div className="msg">
					<h1>Email verified successfully. You may now close this tab.</h1>
				</div>
			) : (
				<h1>404 Not Found</h1>
			)}
		</div>
	);
};

export default EmailVerification;