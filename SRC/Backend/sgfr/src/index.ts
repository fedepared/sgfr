import express, { Request, Response } from 'express'

const app = express()

app.get('/', (req: Request, res: Response) => {
  res.send('Hola, Programación III')
})

app.listen(4000, () => console.log('Servidor en http://localhost:4000'))