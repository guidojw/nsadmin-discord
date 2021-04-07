'use strict'

const { robloxAdapter } = require('../adapters')
const { split } = require('../util').util

async function getIdFromUsername (username) {
  const userIds = (await robloxAdapter('POST', 'users', 'v1/usernames/users', {
    usernames: [username],
    excludeBannedUsers: false
  })).data.data
  if (!userIds?.[0]) {
    throw new Error(`**${username}** doesn't exist on Roblox.`)
  }
  return userIds[0].id
}

async function getRank (userId, groupId) {
  return (await robloxAdapter('GET', 'groups', `v1/users/${userId}/groups/roles`)).data
    .data
    .find(group => group.group.id === groupId)
    .role.rank ?? 0
}

async function getRole (userId, groupId) {
  return (await robloxAdapter('GET', 'groups', `v1/users/${userId}/groups/roles`)).data
    .data
    .find(group => group.group.id === groupId)
    .role.name ?? 'Guest'
}

async function getUser (userId) {
  try {
    return (await robloxAdapter('GET', 'users', `v1/users/${userId}`)).data
  } catch (err) {
    throw new Error(`**${userId}** doesn't exist on Roblox.`)
  }
}

async function getUsers (userIds) {
  let result = []
  const chunks = split(userIds, 100)
  for (const chunk of chunks) {
    result = result.concat((await robloxAdapter('POST', 'users', 'v1/users', {
      userIds: chunk,
      excludeBannedUsers: false
    })).data.data)
  }
  return result
}

async function hasBadge (userId, badgeId) {
  return (await robloxAdapter('GET', 'inventory', `v1/users/${userId}/items/Badge/${badgeId}`)).data.data.length === 1
}

module.exports = {
  getIdFromUsername,
  getRank,
  getRole,
  getUser,
  getUsers,
  hasBadge
}
