import { PipesModule } from './pipes.module';

describe('PipesModule', () => {
  let pipesModule: PipesModule;

  beforeEach(() => {
    pipesModule = new PipesModule();
  });

  it('should create an instance', () => {
    expect(pipesModule).toBeTruthy();
  });
});
