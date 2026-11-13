import React from 'react';
import {Composition, Still} from 'remotion';
import {Reel} from './Reel';
import {TOTAL_FRAMES, FPS} from './timeline';
import {StoryPoll} from './StoryPoll';
import {CityBg} from './CityBg';
import {Cover} from './Cover';

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
    <Still id="CityBg" component={CityBg} width={1080} height={1920} defaultProps={{t: 33.5}} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
    <Still id="StoryPoll" component={StoryPoll} width={1080} height={1920} />
  </>
);
