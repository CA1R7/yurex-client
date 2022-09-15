const __buf = new DataView(new ArrayBuffer(8));

export class BinaryWriter {
  private writer: boolean;
  public _b: number[];
  private _o: number;
  private _e: boolean;
  constructor(little_indian?: boolean) {
    this._b = [];
    this._o = 0;
    this._e = little_indian ?? true;
    this.writer = true;
    this.reset();
  }
  reset() {
    this._b = [];
    this._o = 0;
  }
  setUint8(a: number) {
    if (a >= 0 && a < 256) this._b.push(a);
    return this;
  }
  setInt8(a: number) {
    if (a >= -128 && a < 128) this._b.push(a);
    return this;
  }
  setUint16(a: number) {
    __buf.setUint16(0, a, this._e);
    this._move(2);
    return this;
  }
  setInt16(a: number) {
    __buf.setInt16(0, a, this._e);
    this._move(2);
    return this;
  }
  setUint32(a: number) {
    __buf.setUint32(0, a, this._e);
    this._move(4);
    return this;
  }
  setInt32(a: number) {
    __buf.setInt32(0, a, this._e);
    this._move(4);
    return this;
  }
  setFloat32(a: number) {
    __buf.setFloat32(0, a, this._e);
    this._move(4);
    return this;
  }
  setFloat64(a: number) {
    __buf.setFloat64(0, a, this._e);
    this._move(8);
    return this;
  }
  _move(b: number) {
    for (var i = 0; i < b; i++) {
      this._b.push(__buf.getUint8(i));
    }
  }
  setStringUTF8(s: string) {
    var bytesStr = unescape(encodeURIComponent(s));
    for (var i = 0, l = bytesStr.length; i < l; i++) {
      this._b.push(bytesStr.charCodeAt(i));
    }
    this._b.push(0);
    return this;
  }
  setStringZeroUtf8(s: string) {
    this.setStringUTF8(s);
    this.setUint8(0);
    return this;
  }
  build() {
    return new Uint8Array(this._b);
  }
}

export class BinaryReader {
  private _e: boolean;
  private reader: boolean;
  private view: DataView;
  private _o: number;
  constructor(view: DataView, offset: number, littleEndian: boolean) {
    this._e = littleEndian;
    this.reader = true;
    this.view = view;
    this._o = offset || 0;
  }
  getUint8() {
    return this.view.getUint8(this._o++);
  }
  getInt8() {
    return this.view.getInt8(this._o++);
  }
  getUint16() {
    return this.view.getUint16((this._o += 2) - 2, this._e);
  }
  getInt16() {
    return this.view.getInt16((this._o += 2) - 2, this._e);
  }
  getUint32() {
    return this.view.getUint32((this._o += 4) - 4, this._e);
  }
  getInt32() {
    return this.view.getInt32((this._o += 4) - 4, this._e);
  }
  getFloat32() {
    return this.view.getFloat32((this._o += 4) - 4, this._e);
  }
  getFloat64() {
    return this.view.getFloat64((this._o += 8) - 8, this._e);
  }
  getStringUTF8() {
    var b;
    var s = "";
    while ((b = this.view.getUint8(this._o++)) !== 0) {
      s += String.fromCharCode(b);
    }
    return decodeURIComponent(escape(s)).trim();
  }
}
