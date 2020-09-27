import { extend } from 'flarum/extend';
import TextEditor from 'flarum/components/TextEditor';
import UploadButton from './components/UploadButton';

app.initializers.add('anonfiles-upload', function() {
	extend(TextEditor.prototype, 'controlItems', function(items) {
		items.add('anonfiles-upload', <UploadButton textArea={this} />);
	});
});
