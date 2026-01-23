/**
 * Join Requests API
 * All team join request related API calls
 */

import { httpGet, httpPost, httpPut, httpDelete } from './http';

/**
 * Submit a join request to a team
 * @param {number} teamId - Team ID to join
 * @param {string} [message] - Optional message (max 500 chars)
 * @returns {Promise<Object>} Created join request
 */
export async function submitJoinRequest(teamId, message = null) {
  return await httpPost(`/api/teams/${teamId}/join-requests`, { message });
}

/**
 * Get current user's join requests across all teams
 * Note: Excludes REJECTED requests (user never sees rejections)
 * @returns {Promise<Array>} Array of join requests
 */
export async function getMyJoinRequests() {
  return await httpGet('/api/teams/join-requests/my-requests');
}

/**
 * Cancel own pending join request
 * @param {number} requestId - Request ID to cancel
 * @returns {Promise<void>}
 */
export async function cancelJoinRequest(requestId) {
  return await httpDelete(`/api/teams/join-requests/${requestId}`);
}

/**
 * Get pending join requests for a team (ADMIN/COORDINATOR only)
 * @param {number} teamId - Team ID
 * @param {number} [page=0] - Page number (0-indexed)
 * @param {number} [size=20] - Page size
 * @returns {Promise<Object>} Paginated response with content array
 */
export async function getPendingJoinRequests(teamId, page = 0, size = 20) {
  return await httpGet(`/api/teams/${teamId}/join-requests?page=${page}&size=${size}`);
}

/**
 * Approve a join request (ADMIN/COORDINATOR only)
 * User will be added as PLAYER member
 * @param {number} teamId - Team ID
 * @param {number} requestId - Request ID to approve
 * @param {string} [message] - Optional welcome message
 * @returns {Promise<void>}
 */
export async function approveJoinRequest(teamId, requestId, message = null) {
  return await httpPut(`/api/teams/${teamId}/join-requests/${requestId}/approve`, { message });
}

/**
 * Reject a join request (ADMIN/COORDINATOR only)
 * @param {number} teamId - Team ID
 * @param {number} requestId - Request ID to reject
 * @param {string} [message] - Optional rejection reason (not shown to player in MVP)
 * @returns {Promise<void>}
 */
export async function rejectJoinRequest(teamId, requestId, message = null) {
  return await httpPut(`/api/teams/${teamId}/join-requests/${requestId}/reject`, { message });
}

/**
 * Bulk approve multiple join requests
 * @param {number} teamId - Team ID
 * @param {Array<number>} requestIds - Array of request IDs to approve
 * @param {string} [message] - Optional welcome message for all
 * @returns {Promise<Array>} Results for each request
 */
export async function bulkApproveRequests(teamId, requestIds, message = null) {
  const results = await Promise.allSettled(
    requestIds.map(id => approveJoinRequest(teamId, id, message))
  );
  return results.map((result, index) => ({
    requestId: requestIds[index],
    success: result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason?.message : null,
  }));
}

/**
 * Bulk reject multiple join requests
 * @param {number} teamId - Team ID
 * @param {Array<number>} requestIds - Array of request IDs to reject
 * @param {string} [message] - Optional rejection reason
 * @returns {Promise<Array>} Results for each request
 */
export async function bulkRejectRequests(teamId, requestIds, message = null) {
  const results = await Promise.allSettled(
    requestIds.map(id => rejectJoinRequest(teamId, id, message))
  );
  return results.map((result, index) => ({
    requestId: requestIds[index],
    success: result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason?.message : null,
  }));
}
