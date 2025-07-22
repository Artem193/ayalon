import { useTranslation } from 'react-i18next';

import { Header } from './components/Header/Header';
import { SimpleForm } from './components/SimpleForm/SimpleForm';

import './App.css'

function App() {
  const { t, i18n } = useTranslation();

  return (
    <div className='container'>
      <Header />
      <SimpleForm />
    </div>
  )
}

export default App
