These are the needed end points for the friends system:

1. **Create Friend Request Endpoint**

   * **Method:** POST
   * **Path:** `/api/friend-request/{id}`
   * **Description:** This endpoint creates a new friend request. The `sender_id` is set as `user_id_1` and the `recipient_id` as `user_id_2`. The status is initially `pending`. The backend uses the order of user IDs to determine who initiated the request and responds with the request_id. This immediate response ensures that the frontend can instantly update the UI, allowing the user to see the request in their sent list and perform further actions, like cancellation, right away.

2. **Get Sent Friend Requests Endpoint**

   * **Method:** GET
   * **Path:** `/api/friend-requests?type=sent`
   * **Description:** This endpoint returns all friend requests sent by the logged-in user. The user ID of the sender is identified from the authentication token (e.g., JWT). The backend filters the records to return all requests where the user is the sender. The order of the user IDs in the database helps ensure that the correct user is considered the sender.

3. **Get Received Friend Requests Endpoint**

   * **Method:** GET
   * **Path:** `/api/friend-requests?type=received`
   * **Description:** This endpoint returns all friend requests that the logged-in user has received. The user ID of the recipient is also determined from the authentication token. The backend filters the records to return requests where the user is the recipient. The order of user IDs ensures the correct identification of the recipient.

4. **Action on Friend Request Endpoint**

   * **Method:** POST
   * **Path:** `/api/friend-request/action`
   * **Description:** This endpoint allows the user to take action on a pending friend request. The `request_id` and the `action` (accept, decline, or cancel) are provided. The backend updates the status of the request accordingly.

5. **Check Existing Friendship or Request Endpoint**

   * **Method:** GET
   * **Path:** `/api/friend-request/check/{id}`
   * **Description:** This endpoint checks if there is an existing friend request or friendship between the logged-in user and another user. The logged-in user’s ID is obtained from the authentication token (e.g., a JWT), and the other user’s ID is provided as a query parameter. The backend then checks the `Friendships` table using both user IDs to see if there’s a record that indicates a pending request, an accepted friendship, or a declined request. This allows the frontend to determine if the "Send Friend Request" button should be shown or not.

6. **Remove Friendship Endpoint**

   * **Method:** DELETE
   * **Path:** `/api/friend-request/{id}`
   * **Description:** This endpoint allows the logged-in user to remove an existing friendship. When the user decides to remove a friend, the request will include the specific request_id of that friendship