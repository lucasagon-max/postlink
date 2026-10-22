-- 0020_mensagem_compartilhamento.sql: Adiciona campo para mensagem de divulgação/compartilhamento junto do link
alter table public.links 
add column if not exists mensagem_compartilhamento text 
check (char_length(mensagem_compartilhamento) <= 1000);

comment on column public.links.mensagem_compartilhamento is 
'Texto de divulgação/copy de envio que acompanha o link ao compartilhar no WhatsApp e redes sociais';
