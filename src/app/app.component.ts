import { Component, ElementRef, ViewChild } from '@angular/core';
import weaviate from 'weaviate-ts-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  searchImage = '';
  private _image = 'https://archives.bulbagarden.net/media/upload/thumb/f/fb/0001Bulbasaur.png/250px-0001Bulbasaur.png';
  private _name = 'Click Camera To Search';
  private _weaviateClient = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  get image() {
    return this._image;
  }

  get name() {
    return this._name;
  }

  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  scan() {
    this.cameraInput.nativeElement.click();
  }

  async search(event: Event) {
    // @ts-ignore
    if (event?.target?.value) {
      // @ts-ignore
      const file: File = event.target.files[0];
      const image = await this.toBase64(file);
      const result = (await this._weaviateClient.graphql.get()
        .withClassName('Pokemon')
        .withFields('name,image')
        .withNearImage({ image })
        .withLimit(1)
        .do()).data.Get.Pokemon[0];

      this._image = result.image;
      this._name = result.name;
    }
  }
}
