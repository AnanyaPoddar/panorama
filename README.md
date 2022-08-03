# project-oasis


**Team Details**

Team name: oasis

Project name: Panorama

Team members: Ananya Poddar, Sara Mushtaq, Osman Samet Conger

**Demo Link**

https://www.youtube.com/watch?v=qehIdTs6wII&ab_channel=Sara

**Project Description**

Panorama is an all-inclusive collaborative whiteboarding tool that brings the advantages of technology to traditional whiteboarding. It allows users to securely join a whiteboarding room via a unique invite link and join a voice or video call while collaborating on a shared whiteboard. Users can attach files and use various components to make the whiteboarding session easier. In addition, Panorama enables efficient storage and tracking of all drawings and meetings for future reference. This is accomplished by emailing meeting summaries,vand any completed drawings to the host and all participants, after each whiteboarding session.


**Workflow**

The process begins with a user signing up to Panorama in order to create a room and explore all of its functionality. Signup can occur natively through Panorama or through OAuth integration with Linkedln. Upon successful signup, a host has the ability to create their own room, associated with a unique link. The host can then whitelist any users registered on Panorama to join this room, and send them an invitation. Sending the invitation is done in one of 2 ways:

1. The invitation is sent as an email to the whitelisted users, with the meeting link.
2. If the host is authenticated through Linkedin, any whitelisted users who are also authenticated through Linkedin are invited through a post on which they are tagged. This creates publicity for Panorama on other social platforms.

Only whitelisted users can join the room. In the case of Linkedln integration, this will whitelist the email associated with the connection’s Linkedln account. Users can then accept the invitation, authenticate, and join the room. At any point during the meeting, the host has the ability to kick a user out at which point their access to the room is revoked. 

During the whiteboarding session, users join a workspace and the state of each user’s cursor is tracked. Components such as sticky notes, various shapes, and ability to upload images are available to use to aid in the drawing process. Finally, after a successful whiteboarding and video call session, a summary is sent to all users containing information such as call duration and participants. The host can customize this email by adding any attachments such as the completed drawing. The host retains access to the actual workspace after the end of a whiteboarding session and can further edit, or restart another session in the same workspace to continue where they left off.


**Concepts for the Challenge Factor**

1. **Realtime Interaction**

    The core of the application is real-time interaction, specifically real-time collaboration both through the whiteboarding and audio and video calling features. 
    * To enable these features, we used [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API). We utilized twilio-video to make use of the SFU architecture, and listened for specific websocket events to update the frontend (such as connecting to and disconnecting from a room, and receiving participant videos).
    * To keep track of and display each user’s cursor location on the screen, as well as broadcast the drawing on one user’s screen to the others’ through the shared canvas, we used [socket.io](https://socket.io/) coupled with TLDraw for the canvas.

2. **OAuth 2.0 Client**

    We used LinkedIn as our OAuth provider. The list of features we are planning to implement are provided below.

    * During sign-up, retrieve the account details (name, date of birth, email, etc.) from the provider.
    * Make a post on the user’s LinkedIn inviting other Linkedin-authenticated users to join a workspace and collaborate.
    
3. **Workers**

    We plan to use web workers in Node.js to run scripts in the background, for the following applications:

    * Generate information about the video call as it progresses, such as the live transcript.
    * Send emails containing video call summaries with the information that is relevant to the recipient, once the call has completed.
        * This would include call duration, participant information, and a link to a snapshot of the final drawing.

4. **Integration with Cloud Technologies**

    The cloud provider that we will incorporate services from is Google. We utilized Google Cloud Storage to store completed drawings and provide access to it for all participants, as well as to upload profile pictures.

**Key Features (Beta)**

We plan to have the features related to our main functionality completed by the beta version deadline. This includes the real-time viewing and manipulation of the collaborative drawing space and the audio/video calling feature between members in the same space. Some other features involve the ability to invite other Panorama users to the collaborative spaces, as well as granting the host access to certain privileges within the workspace. We also want to have the user authentication process completed, which includes the OAuth process for users to sign up with their LinkedIn account. Finally, we plan to have a feature where a video summary is sent via email to the host of the call, at a set time after the call has been completed. The video summary would consist of very basic information about the call, such as participant information and call duration.


**Key Features (Final)**

The additional features that we would ideally complete for the final version are features that would enhance the user’s experience and provide more depth to our application. This includes providing templates and more components to interact with in the collaborative space, such as sticky notes, text boxes, and shapes. When hosting a video call, users would be able to invite Linkedin-authenticated users to join the call via a post. That being said, the video summary sent to the users will contain more information in the final version, including the final drawing. Finally, we hope to have a user’s hosting workspaces saved and accessible from one location within their account, and allow them to export their workspace drawings. 


**Tech Stack**

Frontend: React.js

Backend: Node.js

Database: MongoDB

API: REST API


**Method of Deployment**

To establish CI/CD, we’ll use Docker and Github Packages. We are going to containerize the individual components of our application - client, backend, database - using Docker, and store the images of the containers on Github Packages. These Docker images will be running on our VM. By connecting our GitHub repositories for each of the components of our application to our corresponding image on Github Packages, we’ll ensure that changes to the codebase trigger a build of the Docker images. After building the images, we'll pull the new images to our VM, stop the running containers, and restart the new ones.
