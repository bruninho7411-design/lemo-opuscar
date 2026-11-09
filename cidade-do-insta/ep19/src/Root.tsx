import React from 'react';
import {Composition, Still} from 'remotion';
import {Reel} from './Reel';
import {TOTAL_FRAMES, FPS} from './timeline';
import {StoryPoll} from './StoryPoll';
import {CityBg} from './CityBg';
import {Cover} from './Cover';
import {Reel19, REEL19_FRAMES} from './Reel19';
import {Ins, INS} from './Ins';

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Reel19" component={Reel19} durationInFrames={REEL19_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Ins" component={Ins} durationInFrames={Math.round(INS * FPS)} fps={FPS} width={1080} height={1920} />
    <Still id="CityBg" component={CityBg} width={1080} height={1920} defaultProps={{t: 33.5}} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
    <Still id="StoryPoll" component={StoryPoll} width={1080} height={1920} />
  </>
);
