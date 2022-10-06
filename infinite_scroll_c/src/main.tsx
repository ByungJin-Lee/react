import ReactDOM from 'react-dom/client'
import { 
  QueryClientProvider,
  QueryClient
} from 'react-query'
import App from './App'
import './index.css'


const client = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={client}>
    <App />
  </QueryClientProvider>
)
