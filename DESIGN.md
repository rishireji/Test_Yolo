
# YOLO: Serverless Production Architecture

To bypass the costs and complexities of dedicated signaling servers like Render.com, YOLO uses **PeerJS Cloud** and a **Public Discovery Relay**.

## 1. How the "Omegle" Matchmaking Works
Instead of a central matching server, we use a decentralized "Lobby" system:
1.  **PeerJS Initialization**: Every user generates a persistent PeerID based on their ephemeral session.
2.  **Discovery Relay**: Users connect to a public WebSocket (Piesocket/Ably) to "announce" their availability in a specific region.
3.  **Handshake Arbitration**:
    - User A and User B see each other on the relay.
    - If `PeerID_A < PeerID_B`, User A initiates the WebRTC offer.
    - User B answers the call.
4.  **P2P Direct**: Once the handshake is complete, the video/audio/chat flows directly between the two laptops. The relay is no longer used.

## 2. Advantages for Cross-Network Chat
- **Port 443 Support**: PeerJS uses standard HTTPS ports, meaning it works behind most office/school firewalls.
- **Auto-ICE**: It automatically handles the complex negotiation of public vs. private IPs.
- **Data Channels**: Chat messages are sent via RTCDataChannel, making them faster and more secure than server-based chat.

## 3. Production Hardening
- **STUN Servers**: We use Google and Cloudflare STUN servers for maximum discovery.
- **ID Rotation**: Peer IDs are changed every time you "Skip," ensuring you never get re-matched with the same person unless desired.
- **Frame Moderation**: Even in P2P mode, the local AI continues to monitor the camera for safety.
