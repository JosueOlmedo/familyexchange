const i18n = {
  current: 'es',

  t(key) {
    return this.translations[this.current]?.[key] || this.translations['es'][key] || key;
  },

  setLang(lang) {
    this.current = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('intercambio_lang', lang);
  },

  translations: {
    es: {
      // Registration
      reg_title: '🎄 ¡Bienvenido!',
      reg_subtitle: 'Ingresa tu nombre para continuar',
      reg_name_placeholder: 'Tu nombre',
      reg_pick_avatar: 'Elige tu avatar:',
      reg_enter: 'Entrar',
      reg_name_required: 'Escribe tu nombre para continuar',

      // Header
      admin_panel: 'Panel de Administración',
      participant_panel: 'Mi Lista de Deseos',

      // Nav
      nav_config: 'Config',
      nav_families: 'Familias',
      nav_wishlists: 'Listas',
      nav_sorteo: 'Sorteo',
      nav_export: 'Exportar',

      // Config
      config_title: 'Configuración General',
      config_max_gifts: 'Máximo de regalos por persona:',
      config_event_name: 'Nombre del evento:',
      config_budget: 'Presupuesto máximo (opcional):',
      config_npoint_title: 'Almacenamiento en la Nube (npoint.io)',
      config_npoint_label: 'npoint.io Bin ID:',
      config_email_title: 'Configuración de EmailJS',
      config_sender: 'Tu correo (remitente):',
      config_save: 'Guardar Configuración',
      config_upload: 'Subir a la Nube',
      config_download: 'Descargar de la Nube',
      config_saved: 'Configuración guardada ✅',

      // npoint help
      npoint_help_title: '¿Cómo crear tu Bin en npoint.io?',
      npoint_step1: 'Ve a <a href="https://www.npoint.io/" target="_blank">npoint.io</a> (no necesitas cuenta).',
      npoint_step2: 'Pega esto como contenido inicial: <code>{}</code>',
      npoint_step3: 'Haz clic en "Save".',
      npoint_step4: 'Copia el ID de la URL (ej: de <code>api.npoint.io/<b>abc123</b></code> copia <code>abc123</code>).',
      npoint_step5: 'Pégalo arriba y guarda.',

      // EmailJS help
      emailjs_help_title: '¿Cómo configurar EmailJS?',
      emailjs_step1: 'Ve a <a href="https://www.emailjs.com/" target="_blank">emailjs.com</a> y crea una cuenta gratuita.',
      emailjs_step2: 'Conecta tu servicio de correo (Gmail, Outlook, etc.).',
      emailjs_step3: 'Crea un template con variables: <code>{{to_email}}</code>, <code>{{to_name}}</code>, <code>{{event_name}}</code>, <code>{{assigned_person}}</code>, <code>{{wishlist}}</code>, <code>{{budget}}</code>.',
      emailjs_step4: 'Copia tu Public Key, Service ID y Template ID.',

      // Families
      families_title: 'Agregar Familia / Grupo',
      families_name_label: 'Nombre de la familia/grupo:',
      families_name_placeholder: 'Ej: Familia Olmedo',
      families_add: 'Agregar',
      families_empty: 'No hay familias registradas aún.',
      families_add_member: 'Agregar Integrante',
      families_confirm_delete: '¿Eliminar "{name}" y todos sus integrantes?',

      // Wishlists
      wishlists_title: 'Listas de Deseos',
      wishlists_select: '-- Selecciona --',
      wishlists_add_gift: 'Agregar Regalo',
      wishlists_save: 'Guardar Lista',
      wishlists_saved: 'Lista de deseos guardada ✅',
      wishlists_empty: '¡Tu lista está vacía! Agrega los regalos que te gustaría recibir 🎄',
      wishlists_max: 'Máximo {n} regalos por persona',
      wishlists_gift_n: '🎁 Regalo #{n}',
      wishlists_gift_title: 'Nombre/Título:',
      wishlists_gift_link: 'Enlace (URL):',
      wishlists_gift_image: 'URL de imagen:',
      wishlists_gift_desc: 'Descripción:',
      wishlists_gift_notes: 'Notas:',
      wishlists_urls_title: 'URLs Individuales para Participantes',
      wishlists_urls_desc: 'Comparte estos enlaces para que cada persona llene su lista desde su dispositivo.',
      wishlists_urls_requires: 'Requiere npoint.io configurado.',
      wishlists_can_add: 'Puedes agregar hasta {n} regalos a tu lista.',

      // Sorteo
      sorteo_title: '¡Hora del Sorteo!',
      sorteo_start: '¡Iniciar Sorteo!',
      sorteo_results: 'Resultados del Sorteo',
      sorteo_new: 'Nuevo Sorteo',
      sorteo_confirm_clear: '¿Seguro que deseas borrar el sorteo actual?',
      sorteo_impossible: 'No fue posible hacer el sorteo con las restricciones de familia.',
      sorteo_need_members: 'Se necesitan al menos 2 integrantes.',
      sorteo_need_families: 'Se necesitan al menos 2 familias/grupos diferentes.',
      sorteo_no_email: '{n} integrante(s) sin correo: {names}',
      sorteo_ready: '¡Todo listo! {n} participantes de {f} familias.',
      sorteo_complete_title: '¡Sorteo Completado!',
      sorteo_complete_msg: 'Se asignaron {n} intercambios exitosamente. ¿Deseas enviar los correos?',
      sorteo_send_email: 'Enviar Correos',
      sorteo_sending: 'Enviando...',
      sorteo_sent_ok: '✅ {n} correos enviados exitosamente',
      sorteo_sent_errors: 'Enviados: {sent} | Errores: {errors}',
      sorteo_configure_email: 'Configura EmailJS primero',

      // Export
      export_title: 'Exportar Datos',
      export_desc: 'Descarga toda la información del intercambio en formato Excel.',
      export_participants: 'Exportar Participantes',
      export_wishlists: 'Exportar Listas de Deseos',
      export_sorteo: 'Exportar Sorteo',
      export_all: 'Exportar Todo (Excel)',

      // Participant page
      participant_loading: 'Cargando tu lista...',
      participant_invalid: 'Enlace inválido',
      participant_invalid_desc: 'Este enlace no es válido. Contacta al organizador.',
      participant_saving: 'Guardando...',
      participant_save_ok: '¡Lista guardada exitosamente! ✅',
      participant_save_error: 'Error al guardar. Intenta de nuevo.',
      participant_save_btn: 'Guardar Mi Lista',

      // Admin PIN
      admin_pin_title: '🔒 Acceso Admin',
      admin_pin_subtitle: 'Ingresa el PIN de administrador',
      admin_pin_placeholder: 'PIN',
      admin_pin_wrong: 'PIN incorrecto',
      admin_pin_label: 'PIN de administrador (4+ dígitos):',
      admin_pin_hint: 'Protege el panel admin con un PIN. Solo tú lo necesitas.',

      // Duplicates
      member_duplicate_name: 'Ya existe "{name}" en esta familia.',
      member_duplicate_email: 'El correo "{email}" ya está registrado.',

      // Email template
      email_subject: '🎁 {event} - ¡Tu persona asignada!',
      email_greeting: 'Hola',
      email_intro: '¡El sorteo ya se realizó! Aquí está tu persona asignada:',
      email_you_got: 'Te tocó:',
      email_budget_label: 'Presupuesto',
      email_wishlist_title: 'Su lista de deseos:',
      email_no_wishlist: 'No tiene lista de deseos registrada.',
      email_secret: '🤫 Recuerda: ¡es secreto!',
      email_footer: 'Enviado con cariño desde',

      // General
      close: 'Cerrar',
      copy: 'Copiar',
      copied: '¡Copiado!',
      name: 'Nombre',
      email: 'Correo',
    },

    en: {
      reg_title: '🎄 Welcome!',
      reg_subtitle: 'Enter your name to continue',
      reg_name_placeholder: 'Your name',
      reg_pick_avatar: 'Pick your avatar:',
      reg_enter: 'Enter',
      reg_name_required: 'Enter your name to continue',

      admin_panel: 'Admin Panel',
      participant_panel: 'My Wishlist',

      nav_config: 'Config',
      nav_families: 'Families',
      nav_wishlists: 'Wishlists',
      nav_sorteo: 'Draw',
      nav_export: 'Export',

      config_title: 'General Settings',
      config_max_gifts: 'Max gifts per person:',
      config_event_name: 'Event name:',
      config_budget: 'Max budget (optional):',
      config_npoint_title: 'Cloud Storage (npoint.io)',
      config_npoint_label: 'npoint.io Bin ID:',
      config_email_title: 'EmailJS Settings',
      config_sender: 'Your email (sender):',
      config_save: 'Save Settings',
      config_upload: 'Upload to Cloud',
      config_download: 'Download from Cloud',
      config_saved: 'Settings saved ✅',

      npoint_help_title: 'How to create your npoint.io Bin?',
      npoint_step1: 'Go to <a href="https://www.npoint.io/" target="_blank">npoint.io</a> (no account needed).',
      npoint_step2: 'Paste this as initial content: <code>{}</code>',
      npoint_step3: 'Click "Save".',
      npoint_step4: 'Copy the ID from the URL (e.g. from <code>api.npoint.io/<b>abc123</b></code> copy <code>abc123</code>).',
      npoint_step5: 'Paste it above and save.',

      emailjs_help_title: 'How to set up EmailJS?',
      emailjs_step1: 'Go to <a href="https://www.emailjs.com/" target="_blank">emailjs.com</a> and create a free account.',
      emailjs_step2: 'Connect your email service (Gmail, Outlook, etc.).',
      emailjs_step3: 'Create a template with variables: <code>{{to_email}}</code>, <code>{{to_name}}</code>, <code>{{event_name}}</code>, <code>{{assigned_person}}</code>, <code>{{wishlist}}</code>, <code>{{budget}}</code>.',
      emailjs_step4: 'Copy your Public Key, Service ID and Template ID.',

      families_title: 'Add Family / Group',
      families_name_label: 'Family/group name:',
      families_name_placeholder: 'E.g. The Smiths',
      families_add: 'Add',
      families_empty: 'No families registered yet.',
      families_add_member: 'Add Member',
      families_confirm_delete: 'Delete "{name}" and all its members?',

      wishlists_title: 'Wishlists',
      wishlists_select: '-- Select --',
      wishlists_add_gift: 'Add Gift',
      wishlists_save: 'Save List',
      wishlists_saved: 'Wishlist saved ✅',
      wishlists_empty: 'Your list is empty! Add the gifts you\'d like to receive 🎄',
      wishlists_max: 'Maximum {n} gifts per person',
      wishlists_gift_n: '🎁 Gift #{n}',
      wishlists_gift_title: 'Name/Title:',
      wishlists_gift_link: 'Link (URL):',
      wishlists_gift_image: 'Image URL:',
      wishlists_gift_desc: 'Description:',
      wishlists_gift_notes: 'Notes:',
      wishlists_urls_title: 'Individual URLs for Participants',
      wishlists_urls_desc: 'Share these links so each person can fill their list from their device.',
      wishlists_urls_requires: 'Requires npoint.io configured.',
      wishlists_can_add: 'You can add up to {n} gifts to your list.',

      sorteo_title: 'Draw Time!',
      sorteo_start: 'Start Draw!',
      sorteo_results: 'Draw Results',
      sorteo_new: 'New Draw',
      sorteo_confirm_clear: 'Are you sure you want to clear the current draw?',
      sorteo_impossible: 'Could not complete the draw with family restrictions.',
      sorteo_need_members: 'At least 2 members are needed.',
      sorteo_need_families: 'At least 2 different families/groups are needed.',
      sorteo_no_email: '{n} member(s) without email: {names}',
      sorteo_ready: 'All set! {n} participants from {f} families.',
      sorteo_complete_title: 'Draw Completed!',
      sorteo_complete_msg: '{n} exchanges assigned successfully. Do you want to send the emails?',
      sorteo_send_email: 'Send Emails',
      sorteo_sending: 'Sending...',
      sorteo_sent_ok: '✅ {n} emails sent successfully',
      sorteo_sent_errors: 'Sent: {sent} | Errors: {errors}',
      sorteo_configure_email: 'Configure EmailJS first',

      export_title: 'Export Data',
      export_desc: 'Download all exchange information in Excel format.',
      export_participants: 'Export Participants',
      export_wishlists: 'Export Wishlists',
      export_sorteo: 'Export Draw',
      export_all: 'Export All (Excel)',

      participant_loading: 'Loading your list...',
      participant_invalid: 'Invalid link',
      participant_invalid_desc: 'This link is not valid. Contact the organizer.',
      participant_saving: 'Saving...',
      participant_save_ok: 'List saved successfully! ✅',
      participant_save_error: 'Error saving. Try again.',
      participant_save_btn: 'Save My List',

      admin_pin_title: '🔒 Admin Access',
      admin_pin_subtitle: 'Enter the admin PIN',
      admin_pin_placeholder: 'PIN',
      admin_pin_wrong: 'Wrong PIN',
      admin_pin_label: 'Admin PIN (4+ digits):',
      admin_pin_hint: 'Protect the admin panel with a PIN. Only you need it.',

      member_duplicate_name: '"{name}" already exists in this family.',
      member_duplicate_email: 'Email "{email}" is already registered.',

      email_subject: '🎁 {event} - Your assigned person!',
      email_greeting: 'Hi',
      email_intro: 'The draw is done! Here\'s your assigned person:',
      email_you_got: 'You got:',
      email_budget_label: 'Budget',
      email_wishlist_title: 'Their Wishlist:',
      email_no_wishlist: 'No wishlist registered.',
      email_secret: '🤫 Remember: keep it secret!',
      email_footer: 'Sent with love from',

      close: 'Close',
      copy: 'Copy',
      copied: 'Copied!',
      name: 'Name',
      email: 'Email',
    }
  }
};
