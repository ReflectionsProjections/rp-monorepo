import './App.css';
import { ChakraProvider } from '@chakra-ui/react';
import { customTheme } from '@app/theme';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import Attendance from './routes/Attendance';
import routes from './routes';
import Main from './routes/Main';

document.title = 'R|P Admin';

function App() {
    return (
        <ChakraProvider theme={customTheme}>
            <Routes>
                <Route path="attendance" element={<Attendance />} />
                <Route element={<Main />}>
                    <Route path="unauthorized" element={<Box />} />
                    {routes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                    ))}
                </Route>
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </ChakraProvider>
    );
}

export default App;
