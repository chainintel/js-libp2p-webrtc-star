'use strict'

const Hapi = require('hapi')
const config = require('./config')
const log = config.log
const epimetheus = require('epimetheus')
const path = require('path')

exports = module.exports

exports.start = async (options = {}) => {
  const port = options.port || config.hapi.port
  const host = options.host || config.hapi.host

  const http = new Hapi.Server({
    port: port,
    host: host
  })

  await http.register(require('inert'))
  await http.start()

  log('signaling server has started on: ' + http.info.uri)

  http.peers = require('./routes-ws')(http, options.metrics).peers

  http.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.file(path.join(__dirname, 'index.html'), {
        confine: false
      })
    }
  })

  if (options.metrics) {
    // epimetheus.instrument(http)
  }

  return http
}
