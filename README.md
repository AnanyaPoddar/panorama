# project-oasis

**Team Details**

Team name: oasis

Project name: Panorama

Team members: Ananya Poddar, Sara Mushtaq, Osman Samet Conger

**Project Description**

Panorama is an all-inclusive collaborative whiteboarding tool that brings the advantages of technology to traditional whiteboarding. It allows users to securely join a whiteboarding room via a unique invite link and join a voice or video call while collaborating on a shared whiteboard. Users can attach files and use various components to make the whiteboarding session easier. In addition, Panorama enables efficient storage and tracking of all drawings and meetings for future reference. This is accomplished by emailing meeting summaries, video transcripts, and any completed drawings to the host and all participants, after each whiteboarding session.

**Workflow**

The process begins with a user signing up to Panorama in order to create a room and explore all of its functionality. Signup can occur natively through Panorama or through OAuth integration with Linkedln. Upon successful signup, a host has the ability to create their own room, associated with a unique link. The host can then share the link to this room in 1 of 2 ways.

1. They can select users registered on Panorama by inputting the emails associated with their accounts. This will send an email to the users with the meeting link.
2. They can select users from their direct Linkedln connections. This will craft a LinkedIn direct message to the user with the meeting link.

In order for a user to join the meeting via a link, their email must be whitelisted by the host, which must be done using the 2 ways listed above. In the case of Linkedln integration, this will whitelist the email associated with the connection’s Linkedln account. Users can then accept the invitation, authenticate, and join the room. At any point during the meeting, the host has the ability to kick a user out at which point their access to the room is revoked and their email is removed from the whitelist.

During the whiteboarding session, users join a workspace and the state of each user’s cursor is tracked, marked with their username. Components such as sticky notes, various shapes, and ability to upload images are available to use to aid in the drawing process. Finally, after a successful whiteboarding and video call session, the completed drawing is sent to all participants as a file via email, along with a transcript of the video call, if the option is enabled. The host retains access to the actual workspace after the end of a whiteboarding session and can further edit, or restart another session in the same workspace to continue where they left off.

**Concepts for the Challenge Factor**

1. **Realtime Interaction**

   The core of the application is real-time interaction, specifically real-time collaboration both through the whiteboarding and audio and video calling features. To enable these features, we will use [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API), coupled with [fabricjs](https://github.com/fabricjs/fabric.js), an HTML5 Canvas library to enable drawing and drag-and-drop components. The features we plan to implement include the following:

   - Group video and audio calls with WebRTC. This adds complexity as it requires many-to-many connections rather than simpler peer-to-peer communication. We will make use of the Selective Forwarding Unit (SFU) architecture so that each participant sends and receives their media streams from a centralized server. A breakdown of other architectures can be found [here](https://www.callstats.io/blog/webrtc-architectures-explained-in-5-minutes-or-less).
   - To keep track of and display each user’s cursor location on the screen, as well as broadcast the drawing on one user’s screen to the others’ through the shared canvas, we plan to use [socket.io](https://socket.io/) coupled with WebRTC.

2. **OAuth 2.0 Client**

   We are going to use LinkedIn as our OAuth provider. The list of features we are planning to implement are provided below.

   - During sign-up, retrieve the account details (name, date of birth, email, picture, etc.) from the provider and prepopulate the sign-up form, where the user has an option to make modifications if desired.
   - Retrieve the users’ connections, display them along with their names, and pictures, and allow the user to send an invitation to selected connections to join the whiteboard room via a LinkedIn message.
   - Send a connection invite to users who are in the same whiteboard room and are authenticated via LinkedIn.
   - Make a post on the user’s LinkedIn, containing a copy of the exported version of the whiteboard and a custom message.

3. **Workers**

   We plan to use web workers in Node.js to run scripts in the background, for the following applications:

   - Generate information about the video call as it progresses, such as the live transcript.
   - Send emails containing video call summaries with the information that is relevant to the recipient, once the call has completed.
     - For the host, this would include call duration, participant information, and the transcript.
     - For participants, this would include a link to a snapshot of the final drawing.

4. **Integration with Cloud Technologies**

   The cloud provider that we will incorporate services from is Google. The features that we hope to implement are described below:

   - Generate a transcript of the video call using Google Cloud speech-to-text. This will be stored and sent in the video summary after the call’s completion.
   - Store completed drawings as files in Google Cloud storage.
   - Provide users with an option to convert their drawn words into text elements, using the Google Cloud Vision API to perform optical character recognition.

**Key Features (Beta)**

We plan to have the features related to our main functionality completed by the beta version deadline. This includes the real-time viewing and manipulation of the collaborative drawing space and the audio/video calling feature between members in the same space. Some other features involve the ability to invite other Panorama users to the collaborative spaces, as well as granting the host access to certain privileges within the workspace. We also want to have the user authentication process completed, which includes the OAuth process for users to sign up with their LinkedIn account. Finally, we plan to have a feature where a video summary is sent via email to the host of the call, at a set time after the call has been completed. The video summary would consist of very basic information about the call, such as participant information and call duration.

**Key Features (Final)**

The additional features that we would ideally complete for the final version are features that would enhance the user’s experience and provide more depth to our application. This includes more components to interact with in the collaborative space, such as sticky notes, text boxes, and shapes, as well as the option to customize these components. When hosting a video call, users would be able to view their contacts from LinkedIn and successfully invite them to join the call. We also plan on incorporating cloud technologies for the final version, such as for generating the transcript, storing exported drawings, and incorporating OCR. That being said, the video summary sent to the users will contain more information in the final version, including the transcript and the final drawing. Finally, we hope to have a user’s hosting workspaces saved and accessible from one location within their account, and allow them to export their workspace drawings in various formats, for example as an image download, and share them as a post on LinkedIn.

**Tech Stack**

Frontend: React.js

Backend: Node.js

Database: MongoDB

API: REST API

**Method of Deployment**

To establish CI/CD, we’ll use Docker, DockerHub, Watchtower, and GitHub. We are going to containerize the individual components of our application - client, backend, database - using Docker, and store the images of the containers on an individual DockerHub repository. These Docker images will be running on our VM. By connecting our GitHub repositories for each of the components of our application to our corresponding DockerHub repository, we’ll ensure that changes to the codebase trigger a build of the Docker images. Lastly, we’ll check the DockerHub repositories for any changes at regular intervals using Watchtower, pull the new images to our VM, stop the running containers, and restart the new ones.
