import { SharesRoutingModule } from './shares-routing.module';

describe('SharesRoutingModule', () => {
  let sharesRoutingModule: SharesRoutingModule;

  beforeEach(() => {
    sharesRoutingModule = new SharesRoutingModule();
  });

  it('should create an instance', () => {
    expect(sharesRoutingModule).toBeTruthy();
  });
});
