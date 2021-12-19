import { AppRoutesParamList } from '../routes/app.routes';

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends AppRoutesParamList {}
  }
}
