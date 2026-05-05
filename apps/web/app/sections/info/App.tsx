import { ChakraProvider } from '@chakra-ui/react'
import { customTheme } from '@app/theme'
import { Routes, Route } from 'react-router-dom'
import { Home } from './routes/Home'
// import { Archive } from "./routes/Archive";
// import { FAQ } from "./routes/FAQ";
import { Navbar } from './components/Navbar'
import TeamPage from './routes/Team'

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <Navbar />
      <Routes>
        <Route path="" element={<Home />} />
        {/* <Route path="archive" element={<Archive />} /> */}
        {/* <Route path="faq" element={<FAQ />} /> */}
        <Route path="team" element={<TeamPage />} />
      </Routes>
    </ChakraProvider>
  )
}

export default App
