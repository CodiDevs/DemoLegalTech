import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElasticGalleryComponent, GalleryItem } from './elastic-gallery.component';

const ITEMS: GalleryItem[] = [
  { id: '01', title: 'Uno', category: 'A', src: '/a.jpg', alt: 'a' },
  { id: '02', title: 'Dos', category: 'B', src: '/b.jpg', alt: 'b' },
  { id: '03', title: 'Tres', category: 'C', src: '/c.jpg', alt: 'c' },
];

describe('ElasticGalleryComponent', () => {
  let fixture: ComponentFixture<ElasticGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElasticGalleryComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ElasticGalleryComponent);
  });

  afterEach(() => fixture.destroy());

  it('activa defaultActive si existe, si no el primero', () => {
    fixture.componentInstance.items = ITEMS;
    fixture.componentInstance.defaultActive = '02';
    fixture.detectChanges();
    expect(fixture.componentInstance.activeId).toBe('02');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.eg-panel.active').length).toBe(1);
  });

  it('cambia selección con click, focus y flechas, y respeta límites', () => {
    fixture.componentInstance.items = ITEMS;
    fixture.componentInstance.defaultActive = '01';
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = root.querySelectorAll<HTMLButtonElement>('.eg-panel');

    buttons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeId).toBe('03');

    buttons[1].dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeId).toBe('02');

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(fixture.componentInstance.activeId).toBe('03');
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(fixture.componentInstance.activeId).toBe('03');
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(fixture.componentInstance.activeId).toBe('02');
  });

  it('muestra vacío si no hay ítems', () => {
    fixture.componentInstance.items = [];
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.eg-empty')).not.toBeNull();
    expect(root.querySelectorAll('.eg-panel').length).toBe(0);
    expect(fixture.componentInstance.activeId).toBe('');
  });
});
