import { EventEmitter } from 'events';
import { MessageDescriptor, PrimitiveType } from '../descriptor';
import { ObservableArray } from '@selfage/observable_array';

export interface HomeState {
  on(event: 'videoId', listener: (newValue: string, oldValue: string) => void): this;
  on(event: 'init', listener: () => void): this;
}

export class HomeState extends EventEmitter {
  private videoId_?: string;
  get videoId(): string {
    return this.videoId_;
  }
  set videoId(value: string) {
    let oldValue = this.videoId_;
    if (value === oldValue) {
      return;
    }
    this.videoId_ = value;
    this.emit('videoId', this.videoId_, oldValue);
  }

  public triggerInitialEvents(): void {
    if (this.videoId_ !== undefined) {
      this.emit('videoId', this.videoId_, undefined);
    }
    this.emit('init');
  }

  public toJSON(): Object {
    return {
      videoId: this.videoId,
    };
  }
}

export let HOME_STATE: MessageDescriptor<HomeState> = {
  name: 'HomeState',
  factoryFn: () => {
    return new HomeState();
  },
  fields: [
    {
      name: 'videoId',
      primitiveType: PrimitiveType.STRING,
    },
  ]
};

export interface HistoryState {
  on(event: 'videoIds', listener: (newValue: ObservableArray<string>, oldValue: ObservableArray<string>) => void): this;
  on(event: 'init', listener: () => void): this;
}

export class HistoryState extends EventEmitter {
  private videoIds_?: ObservableArray<string>;
  get videoIds(): ObservableArray<string> {
    return this.videoIds_;
  }
  set videoIds(value: ObservableArray<string>) {
    let oldValue = this.videoIds_;
    if (value === oldValue) {
      return;
    }
    this.videoIds_ = value;
    this.emit('videoIds', this.videoIds_, oldValue);
  }

  public triggerInitialEvents(): void {
    if (this.videoIds_ !== undefined) {
      this.emit('videoIds', this.videoIds_, undefined);
    }
    this.emit('init');
  }

  public toJSON(): Object {
    return {
      videoIds: this.videoIds,
    };
  }
}

export let HISTORY_STATE: MessageDescriptor<HistoryState> = {
  name: 'HistoryState',
  factoryFn: () => {
    return new HistoryState();
  },
  fields: [
    {
      name: 'videoIds',
      primitiveType: PrimitiveType.STRING,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
  ]
};

export interface State {
  on(event: 'showHome', listener: (newValue: boolean, oldValue: boolean) => void): this;
  on(event: 'homeState', listener: (newValue: HomeState, oldValue: HomeState) => void): this;
  on(event: 'historyState', listener: (newValue: HistoryState, oldValue: HistoryState) => void): this;
  on(event: 'init', listener: () => void): this;
}

export class State extends EventEmitter {
  private showHome_?: boolean;
  get showHome(): boolean {
    return this.showHome_;
  }
  set showHome(value: boolean) {
    let oldValue = this.showHome_;
    if (value === oldValue) {
      return;
    }
    this.showHome_ = value;
    this.emit('showHome', this.showHome_, oldValue);
  }

  private homeState_?: HomeState;
  get homeState(): HomeState {
    return this.homeState_;
  }
  set homeState(value: HomeState) {
    let oldValue = this.homeState_;
    if (value === oldValue) {
      return;
    }
    this.homeState_ = value;
    this.emit('homeState', this.homeState_, oldValue);
  }

  private historyState_?: HistoryState;
  get historyState(): HistoryState {
    return this.historyState_;
  }
  set historyState(value: HistoryState) {
    let oldValue = this.historyState_;
    if (value === oldValue) {
      return;
    }
    this.historyState_ = value;
    this.emit('historyState', this.historyState_, oldValue);
  }

  public triggerInitialEvents(): void {
    if (this.showHome_ !== undefined) {
      this.emit('showHome', this.showHome_, undefined);
    }
    if (this.homeState_ !== undefined) {
      this.emit('homeState', this.homeState_, undefined);
    }
    if (this.historyState_ !== undefined) {
      this.emit('historyState', this.historyState_, undefined);
    }
    this.emit('init');
  }

  public toJSON(): Object {
    return {
      showHome: this.showHome,
      homeState: this.homeState,
      historyState: this.historyState,
    };
  }
}

export let STATE: MessageDescriptor<State> = {
  name: 'State',
  factoryFn: () => {
    return new State();
  },
  fields: [
    {
      name: 'showHome',
      primitiveType: PrimitiveType.BOOLEAN,
    },
    {
      name: 'homeState',
      messageDescriptor: HOME_STATE,
    },
    {
      name: 'historyState',
      messageDescriptor: HISTORY_STATE,
    },
  ]
};
