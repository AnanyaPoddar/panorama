

Panorama is an all-inclusive collaborative whiteboarding tool that brings the advantages of technology to traditional whiteboarding. It allows users to securely join a whiteboarding room via a unique invite link and join a voice or video call while collaborating on a shared whiteboard. Users can attach files and use various components to make the whiteboarding session easier. In addition, Panorama enables efficient storage and tracking of all drawings and meetings for future reference. This is accomplished by emailing meeting summaries,vand any completed drawings to the host and all participants, after each whiteboarding session.


[View The Demo Here](https://www.youtube.com/watch?v=qehIdTs6wII&ab_channel=Sara)


**Technologies and Concepts**
- MERN stack
- [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)(SFU Architecture) for audio and video calling, using twilio-video
- [socket.io](https://socket.io/) for collaborative drawing, and TLDraw for the canvas
- OAauth 2.0 for Linkedin integration
- Workers to send emails containing video summaries once the call has completed
- GCP (Google Cloud Storage) to store completed drawings and profile pictures
- Express-session for authentication and authorization
