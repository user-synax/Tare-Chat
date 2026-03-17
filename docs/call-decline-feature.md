# Call Decline Feature

This document outlines the implementation of the call decline feature.

## Event Flow

1.  **User B (callee)** clicks the "Decline" button in the `IncomingCallDialog`.
2.  The `handleRejectCall` function in `ChatWindow.jsx` is triggered.
3.  An API request is sent to `POST /api/voice/decline` with the `callerId` and `calleeId`.
4.  The API route validates the request and uses Pusher to trigger a `call-declined` event on a user-specific channel (`user-{callerId}`).
5.  **User A (caller)**, who is listening on this channel, receives the event.
6.  The `call-declined` event handler in `ChatWindow.jsx` sets the `callStatus` to `idle`, which closes the `VoiceCallModal`.
7.  A toast notification from `react-hot-toast` is displayed to User A, informing them that their call was declined.

## API Endpoint

-   **`POST /api/voice/decline`**
    -   **Body**:
        ```json
        {
          "callerId": "<user_id_of_caller>",
          "calleeId": "<user_id_of_callee>"
        }
        ```
    -   **Description**: Broadcasts a `call-declined` event to the specified caller.
