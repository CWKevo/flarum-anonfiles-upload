import Component from 'flarum/Component';
import icon from 'flarum/helpers/icon';
import LoadingIndicator from 'flarum/components/LoadingIndicator';

export default class UploadButton extends Component {
    init() {
        this.isLoading = false;
        this.isSuccess = false;
        this.isError = false;
        
        document.addEventListener('paste', this.paste.bind(this));
    }
    
    view() {
        let attrs = {
            className: 'Button hasIcon anonfile-upload-button',
            title: app.translator.trans('anonfile-upload.forum.upload'),
            config: (el) => {
                this.domElement = el;
                $(el).tooltip();
            }
        };
        
        let buttonIcon;
        if (this.isLoading) buttonIcon = LoadingIndicator.component({ className: 'Button-icon' });
        else if (this.isSuccess) buttonIcon = icon('fas fa-check green', { className: 'Button-icon' });
        else if (this.isError) buttonIcon = icon('fas fa-times red', { className: 'Button-icon' });
        else buttonIcon = icon('far fa-image', { className: 'Button-icon' });
        
        let label = '';
        if (this.isLoading) label = app.translator.trans('anonfile-upload.forum.loading');
        else if (this.isSuccess) label = app.translator.trans('anonfile-upload.forum.done');
        else if (this.isError) label = app.translator.trans('anonfile-upload.forum.error');
        
        // When there is no label, the component element should be shown as a square button
        if (label == '') {
            attrs.className += ' Button--icon';
        }
        
        return m('div', attrs, [
            buttonIcon,
                m('span', { className: 'Button-label' }, label),
                m('form#anonfile-upload-form', [
                    m('input', {
                        type: 'file',
                        accept: '*',
                        onchange: this.formUpload.bind(this),
                        // disable button while doing things
                        disabled: this.isLoading || this.isSuccess || this.isError
                    })
                ])
            ]
        );
    }
    
    paste(e) {
        if (this.isLoading) return;
        
        if (e.clipboardData && e.clipboardData.items) {
            let item = e.clipboardData.items[0];

            let file = item.getAsFile();
            this.upload(file);
        }
    }
    
    formUpload(e) {
        let file = $(e.target)[0].files[0];
        this.upload(file);
    }
    
    upload(file) {
        $(this.domElement).tooltip('hide'); // force removal of the tooltip
        this.isLoading = true;
        m.redraw();

        let formData = new FormData();
        formData.append('image', file);
	console.log("FormData: " + formData);
		
        $.ajax({
            url: 'https://api.anonfiles.com/upload',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: this.success.bind(this),
            error: this.error.bind(this)
        });
    }
    
    success(response) {
        $('#anonfile-upload-form input').val('');
        
        this.isLoading = false;
        this.isSuccess = true;
        m.redraw();
        
        let imageLink = response.data.file.url.full;

        let stringToInject = `{imageLink}`;
        this.props.textArea.insertAtCursor(stringToInject);

        // After a bit, re-enable upload
        setTimeout(() => {
            this.isSuccess = false;
            m.redraw();
        }, 2000);
    }
    
    error(response) {
        $('#anonfile-upload-form').val('');
        
        this.isLoading = false;
        this.isError = true;
        m.redraw();

        // Output the error to the console, for debugging purposes
        console.error(response);

        // After a bit, re-enable upload
        setTimeout(() => {
            this.isError = false;
            m.redraw();
        }, 2000);
    }
}
