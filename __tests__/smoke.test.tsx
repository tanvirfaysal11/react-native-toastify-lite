import { act, render, screen } from '@testing-library/react-native';
import { toast, ToastProvider } from '../src';

afterEach(async () => {
  await act(async () => {
    toast.dismissAll();
  });
});

test('renders a toast without crashing', async () => {
  await render(<ToastProvider />);

  await act(async () => {
    toast.success('Saved', { description: 'Your changes are ready.' });
  });

  expect(screen.getByText('Saved')).toBeTruthy();
});

test('renders an action toast header', async () => {
  await render(<ToastProvider />);

  await act(async () => {
    toast.error('Delete this photo?', {
      description: 'This cannot be undone.',
      action: { label: 'Delete', onPress: () => {} },
      secondaryAction: { label: 'Keep', onPress: () => {} },
    });
  });

  expect(screen.getByText('Delete this photo?')).toBeTruthy();
});
