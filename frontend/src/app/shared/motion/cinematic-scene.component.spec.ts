import { TestBed } from '@angular/core/testing';
import { CinematicSceneComponent } from './cinematic-scene.component';

describe('CinematicSceneComponent', () => {
  it('pinta el capítulo visible sin clase activa', async () => {
    await TestBed.configureTestingModule({
      imports: [CinematicSceneComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CinematicSceneComponent);
    fixture.componentInstance.sceneId = 'flujo';
    fixture.componentInstance.act = 2;
    fixture.detectChanges();
    const section = (fixture.nativeElement as HTMLElement).querySelector('.cine-scene');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('id')).toBe('flujo');
    expect(section?.classList.contains('is-sticky')).toBeFalse();
    fixture.destroy();
  });
});
