import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/query-provider';
import router from './routers';
import { RootProvider } from './store'

function App() {
  return (
    <RootProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </RootProvider>
  )
}

export default App