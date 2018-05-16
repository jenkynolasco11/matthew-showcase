var uploadBtn = $('#fake-upload-btn')
var fileBtn = $('#file-uploader [type=file]')
var uploadForm = $('#file-uploader')
var dropZone = $('.drag-zone')
var uploadedFiles = $('.already-uploaded-files')
var placeholder = '/assets/images/car-not-available-placeholder.jpg'

var filesArray = []

function getFiles() {
    $.get('/user/files', function(data) {
        if(data.ok) {
            function itemTemplate(name, index, path, extraClass) {
                var element = $(
                    `
                        <div class="uploaded-file ${ extraClass }">
                            <div class="index">${ index }</div>
                            <div class="name">${ name }</div>
                            <div class="img">
                            </div>
                        </div>
                    `
                )
                var anchor = $(`<a href="${ '/' + path }" target="_blank"></a>`)
                var img = $('<img alt="preview"/>')
                img.attr('src', path)

                anchor.append(img)

                element.children('.img').append( extraClass ? '' : anchor)

                return element
            }

            uploadedFiles.html(itemTemplate('File Name', '#', 'Preview', 'header'))

            data.fnames.forEach(function(f, i) {
                var element = itemTemplate(f.name, i+1, ''+f.path, '')

                // console.log(element)

                uploadedFiles.append(element)
            })
        }
    })
}

function newImageFileTemplate(src, name, itmName) {
    return `
        <div class="img-itm" data-name="${ itmName }">
            <div class="close-handle">
                <div class="close"></div>
            </div>
            <div class="img">
                <img src="${ src }" alt="image to upload" />
            </div>
            <div class="title">
                <span>${ name }</span>
            </div>
        </div>
    `
}

function onDeleteFile() {
    var itm = $(this).parent()

    var index = itm.index()

    filesArray = [].concat(filesArray.filter(function(_, i) {
        return i !== index
    }))

    itm.remove()
}

function fileClosure(file) {
    var reader = new FileReader()
    var name = file.name
    var type = file.type
    var size = file.size
    var dataName = `file-${filesArray.length}`

    reader.onloadend = function() {
        var src = reader.result
        var dataName = `file-${filesArray.length}`

        filesArray.push({ file : file, name : name, type : type, size : size })

        var newItm = $(newImageFileTemplate(src, name, dataName))

        newItm.children('.close-handle').on('click', onDeleteFile)

        dropZone.append(newItm)
    }

    reader.readAsDataURL(file)
}

function addFilesToArray(files) {
    for(var i = 0; i < files.length; i++) {
        var file = files[ i ]

        fileClosure(file)
    }
}

function triggerUploadBtn() {
    fileBtn.trigger('click')
}

function onUploadChange(e) {
    var files = e.target.files

    addFilesToArray(files)
}

function onDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()

    $(dropZone).addClass('dragging')
}

function onDragLeave(e) {
    $(dropZone).removeClass('dragging')
}

function onDragOver(e){
    e.preventDefault()
    e.stopPropagation()
}

function onDrop(e) {
    e.preventDefault()
    e.stopPropagation()

    $(dropZone).removeClass('dragging')

    var files = e.originalEvent.dataTransfer.files

    Array.from(files).forEach(function(file) {
        if(/image\/.*/.test(file.type)) addFilesToArray([ file ])
    })
}

function onUploadSubmit(e) {
    e.preventDefault()

    var form = new FormData()

    filesArray.forEach(function(file) {
        form.append('files[]', file.file, file.name)
    })

    $.ajax({
        url : '/user/files',
        method : 'POST',
        cache: false,
        contentType: false,
        processData: false,
        data : form,
        success : function(e) {
            dropZone.html('')

            getFiles()
        },
        error : function(e) {
            console.log('There is an error....')
            console.log(e)
        }
    })
}

$(document).ready(function() {
    uploadBtn.on('click', triggerUploadBtn)
    fileBtn.on('change', onUploadChange)

    dropZone.on({
        dragenter : onDragEnter,
        dragleave : onDragLeave,
        dragover : onDragOver,
        drop : onDrop,
    })

    uploadForm.submit(onUploadSubmit)
    getFiles()
})
