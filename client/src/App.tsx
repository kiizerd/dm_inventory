import './App.css';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider, MultiSelect } from '@mantine/core';
import Inventory from './components/Inventory/Inventory.tsx';

const apiBase = (import.meta.env.VITE_API_BASE as string) || '/api';

const theme = createTheme({
  primaryColor: 'indigo',
  components: {
    MultiSelect: MultiSelect.extend({
      defaultProps: {
        chevronColor: 'indigo',
        styles: (theme) => ({
          pill: { backgroundColor: theme.colors.indigo[6] },
        }),
      },
    }),
  },
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Inventory endpoint={apiBase + '/inventory'} />
    </MantineProvider>
  );
}

export default App;
