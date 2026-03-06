async function bootstrapWorker() {
  console.log('Worker base iniciado')
}

bootstrapWorker().catch((error) => {
  console.error('Error iniciando worker', error)
  process.exit(1)
})
