import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { confirm } from 'nexus-module';
import { clearComposeContext } from 'actions/actionCreators';
import { createPost } from 'actions/createAsset';
import { formatAddress } from '../utils/verification';
import {
  ComposeCard,
  ComposeTextarea,
  ComposeFooter,
  CharCount,
  ComposeActions,
  PrimaryButton,
  SmallButton,
  QuotedPost,
  QuotedAuthor,
  QuotedText,
} from '../components/styles';

const MAX_CHARS = 512;

export default function ComposePost({ onPostCreated }) {
  const dispatch = useDispatch();
  const replyTo = useSelector((state) => state.ui.replyTo);
  const quote = useSelector((state) => state.ui.quote);

  const [text, setText] = useState('');
  const [cw, setCw] = useState('');
  const [showCW, setShowCW] = useState(false);
  const [posting, setPosting] = useState(false);

  const charCount = text.length;
  const isWarning = charCount > 450;
  const isError = charCount > MAX_CHARS;
  const hasContext = !!replyTo || !!quote;
  const contextPost = replyTo || quote;

  const handlePost = async () => {
    if (!text.trim() || isError || posting) return;

    const confirmed = await confirm({
      question: 'Publish this post to the Nexus blockchain?',
      note: 'This will create an on-chain asset. This action costs 1 NXS.',
    });

    if (!confirmed) return;

    setPosting(true);

    try {
      await createPost(
        {
          text: text.trim(),
          replyTo: replyTo?.address || '',
          quote: quote?.address || '',
          cw: cw.trim(),
        },
        () => {
          setText('');
          setCw('');
          setShowCW(false);
          dispatch(clearComposeContext());
          if (onPostCreated) {
            setTimeout(onPostCreated, 2000);
          }
        },
        () => {}
      );
    } finally {
      setPosting(false);
    }
  };

  const handleClearContext = () => {
    dispatch(clearComposeContext());
  };

  return (
    <ComposeCard>
      {hasContext && contextPost && (
        <QuotedPost>
          <QuotedAuthor>
            {replyTo ? 'Replying to' : 'Quoting'} @
            {contextPost["Creator's namespace"] ||
              formatAddress(contextPost.owner, 12)}
          </QuotedAuthor>
          <QuotedText>
            {(contextPost.text || contextPost.Text || '').slice(0, 120)}
            {(contextPost.text || contextPost.Text || '').length > 120
              ? '...'
              : ''}
          </QuotedText>
          <SmallButton
            onClick={handleClearContext}
            style={{ marginTop: 6, fontSize: 11 }}
          >
            Clear
          </SmallButton>
        </QuotedPost>
      )}

      {showCW && (
        <ComposeTextarea
          value={cw}
          onChange={(e) => setCw(e.target.value)}
          placeholder="Content warning (optional)..."
          style={{ minHeight: 40, marginBottom: 8 }}
          maxLength={64}
        />
      )}

      <ComposeTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind? Post to the blockchain..."
        maxLength={MAX_CHARS + 50}
      />

      <ComposeFooter>
        <ComposeActions>
          <SmallButton
            onClick={() => setShowCW(!showCW)}
            style={{ fontSize: 11 }}
          >
            {showCW ? 'Hide CW' : 'CW'}
          </SmallButton>
          <CharCount warning={isWarning ? 1 : 0} error={isError ? 1 : 0}>
            {charCount}/{MAX_CHARS}
          </CharCount>
        </ComposeActions>
        <PrimaryButton
          onClick={handlePost}
          disabled={!text.trim() || isError || posting}
        >
          {posting ? 'Publishing...' : 'Post to Nexus'}
        </PrimaryButton>
      </ComposeFooter>
    </ComposeCard>
  );
}
