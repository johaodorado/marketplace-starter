import { PrismaClient, RolUsuario } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@marketplace.local'
  const exists = await prisma.usuario.findUnique({ where: { email } })

  if (exists) {
    console.log('Admin ya existe')
    return
  }

  const passwordHash = await bcrypt.hash('Admin12345', 10)

  await prisma.usuario.create({
    data: {
      email,
      passwordHash,
      rol: RolUsuario.ADMIN,
      nombre: 'Admin',
      apellido: 'Marketplace'
    }
  })

  console.log('Admin creado')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
